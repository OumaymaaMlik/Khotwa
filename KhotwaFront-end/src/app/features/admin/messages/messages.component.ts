import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { MessageService } from '../../../core/services/message.service';
import { AuthService } from '../../../core/services/auth.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Message } from '../../../core/models/message.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class AdminMessagesComponent implements  OnInit, OnDestroy{

  @ViewChild('fileInput') fileInput!: ElementRef;

  conversations: any[] = [];
  selectedConv: any = null;
  newMsg = '';
  loading = false;
  searchQuery = '';
  pendingFile: File | null = null;
  pendingFileUrl: string | null = null;
  showDeletePopup = false;
  pendingDeleteMsg: any = null;
  typingTimeout: any = null;
  isTyping = false;
  onlineUsers: Set<number> = new Set();

  private wsSubscriptions: Subscription[] = [];

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private wsService: WebSocketService,
    private notifService: NotificationService
  ) {}

  get currentUserId(): number {
    const id = this.authService.currentUser?.id;
    if (id === 'u1') return 3;  
    if (id === 'u2') return 2;  
    if (id === 'u3') return 1;  
    return 2;
  }

  ngOnInit() {
    this.loadInbox();
    this.wsService.onConnected = (userId) => {
    this.setupWebSocketListeners();
    this.messageService.announceOnline(userId).subscribe({
      next: (onlineUsers) => {
        if (onlineUsers) {
          onlineUsers.forEach(id => this.onlineUsers.add(id));
        }
      }
    });
  };
    this.wsService.connect(this.currentUserId);
  }

  ngOnDestroy() {
    this.wsSubscriptions.forEach(s => s.unsubscribe());
    this.messageService.announceOffline(this.currentUserId).subscribe();
    this.wsService.disconnect();
  }

  setupWebSocketListeners() {
    this.wsSubscriptions.push(
      this.wsService.newMessage$.subscribe(msg => {
        this.handleNewMessage(msg);
      })
    );

    this.wsSubscriptions.push(
      this.wsService.messageUpdate$.subscribe(msg => {
        this.handleMessageUpdate(msg);
      })
    );

    this.wsSubscriptions.push(
      this.wsService.typing$.subscribe(event => {
        if (this.selectedConv?.participantId === event.userId) {
          this.isTyping = event.typing;
        }
      })
    );

    this.wsSubscriptions.push(
      this.wsService.status$.subscribe(event => {
        if (event.online) {
          this.onlineUsers.add(event.userId);
        } else {
          this.onlineUsers.delete(event.userId);
        }
      })
    );

    this.messageService.getOnlineUsers().subscribe({
      next: (users) => {
        if (users) users.forEach(id => this.onlineUsers.add(id));
      }
    });
  }

  handleNewMessage(msg: Message) {
    const otherId = msg.senderId === this.currentUserId ? msg.receiverId : msg.senderId;
    const conv = this.conversations.find(c => c.participantId === otherId);
    const newMsgObj = {
      id: msg.id,
      text: msg.body,
      time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mine: msg.senderId === this.currentUserId,
      status: msg.status,
      fileUrl: msg.fileUrl,
      deleted: msg.deletedForAll || false
    };

    if (conv) {
      conv.messages.push(newMsgObj);
      conv.lastMsg = msg.body;
      if (msg.receiverId === this.currentUserId) conv.unread++;
      if (this.selectedConv?.participantId === otherId) {
        this.selectedConv.messages.push(newMsgObj);
      }
    } else {
      this.conversations.unshift({
        id: `conv-${otherId}`,
        participantId: otherId,
        nom: `User ${otherId}`,
        initials: `U${otherId}`,
        color: this.getColor(otherId),
        lastMsg: msg.body,
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        unread: msg.receiverId === this.currentUserId ? 1 : 0,
        messages: [newMsgObj]
      });
    }
  }

  handleMessageUpdate(msg: Message) {
    this.conversations.forEach(conv => {
      const msgIndex = conv.messages.findIndex((m: any) => m.id === msg.id);
      if (msgIndex !== -1) {
        conv.messages[msgIndex].status = msg.status;
        conv.messages[msgIndex].deleted = msg.deletedForAll ||
          msg.deletedForUsers?.split(',').includes(String(this.currentUserId)) || false;
        conv.messages[msgIndex].text = conv.messages[msgIndex].deleted ? 'message deleted' : msg.body;
        conv.messages[msgIndex].fileUrl = conv.messages[msgIndex].deleted ? null : msg.fileUrl;
      }
    });
    if (this.selectedConv) {
      const msgIndex = this.selectedConv.messages.findIndex((m: any) => m.id === msg.id);
      if (msgIndex !== -1) {
        this.selectedConv.messages[msgIndex].status = msg.status;
        this.selectedConv.messages[msgIndex].deleted = msg.deletedForAll ||
          msg.deletedForUsers?.split(',').includes(String(this.currentUserId)) || false;
        this.selectedConv.messages[msgIndex].text = this.selectedConv.messages[msgIndex].deleted ? 'message deleted' : msg.body;
        this.selectedConv.messages[msgIndex].fileUrl = this.selectedConv.messages[msgIndex].deleted ? null : msg.fileUrl;
      }
    }
  }

  isOnline(userId: number): boolean {
    return this.onlineUsers.has(userId);
  }

  loadInbox() {
    this.loading = true;
    const inbox$ = this.messageService.getActiveInbox(this.currentUserId);
    const sent$ = this.messageService.getSent(this.currentUserId);

    import('rxjs').then(({ forkJoin }) => {
      forkJoin([inbox$, sent$]).subscribe({
        next: ([inboxPage, sentPage]) => {
          const all = [...inboxPage.content, ...sentPage.content];
          const unique = all.filter((msg, index, self) =>
            index === self.findIndex(m => m.id === msg.id)
          );
          unique.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          this.conversations = this.groupByConversation(unique);
          this.loading = false;
        },
        error: (err) => {
          console.error('Failed to load messages', err);
          this.loading = false;
        }
      });
    });
  }

  get filteredConversations(): any[] {
    if (!this.searchQuery.trim()) return this.conversations;
    const q = this.searchQuery.toLowerCase();
    return this.conversations.filter(c =>
      c.nom.toLowerCase().includes(q) ||
      c.lastMsg.toLowerCase().includes(q)
    );
  }

  groupByConversation(messages: Message[]): any[] {
    const groups: { [key: number]: any } = {};
    messages.forEach(msg => {
      const otherId = msg.senderId === this.currentUserId ? msg.receiverId : msg.senderId;
      if (!groups[otherId]) {
        groups[otherId] = {
          id: `conv-${otherId}`,
          participantId: otherId,
          nom: `User ${otherId}`,
          initials: `U${otherId}`,
          color: this.getColor(otherId),
          lastMsg: msg.body,
          time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: 0,
          messages: []
        };
      }
      if (msg.status === 'PENDING' && msg.receiverId === this.currentUserId) {
        groups[otherId].unread++;
      }
      groups[otherId].messages.push({
        id: msg.id,
        text: msg.deletedForAll ? 'message deleted' :
              (msg.deletedForUsers?.split(',').includes(String(this.currentUserId)) ? 'message deleted' : msg.body),
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mine: msg.senderId === this.currentUserId,
        status: msg.status,
        fileUrl: msg.deletedForAll ? null :
                 (msg.deletedForUsers?.split(',').includes(String(this.currentUserId)) ? null : msg.fileUrl),
        deleted: msg.deletedForAll || msg.deletedForUsers?.split(',').includes(String(this.currentUserId)) || false
      });
    });
    return Object.values(groups);
  }

  selectConv(c: any) {
    this.selectedConv = { ...c, unread: 0 };
    c.unread = 0;
    c.messages
      .filter((m: any) => !m.mine && m.status === 'PENDING')
      .forEach((m: any) => {
        this.messageService.updateStatus(m.id, 'READ').subscribe();
      });
  }

  onMsgInput() {
    if (!this.selectedConv) return;
    this.wsService.sendTyping(this.currentUserId, this.selectedConv.participantId, true);
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.wsService.sendTyping(this.currentUserId, this.selectedConv.participantId, false);
    }, 2000);
  }

  triggerFileInput() { this.fileInput.nativeElement.click(); }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.pendingFile = file;
    this.pendingFileUrl = null;
    this.messageService.uploadFile(file).subscribe({
      next: (url) => { this.pendingFileUrl = url; },
      error: (err) => console.error('Failed to upload file', err)
    });
  }

  sendMsg() {
    if (!this.newMsg.trim() && !this.pendingFileUrl || !this.selectedConv) return;
    const message: any = {
      subject: 'Direct Message',
      body: this.newMsg || '📎 File attachment',
      senderId: this.currentUserId,
      receiverId: this.selectedConv.participantId,
      type: 'DIRECT_MESSAGE',
      fileUrl: this.pendingFileUrl || null
    };
    this.wsService.sendTyping(this.currentUserId, this.selectedConv.participantId, false);
    this.messageService.sendMessage(message).subscribe({
      next: (saved) => {
        this.selectedConv.messages.push({
          id: saved.id,
          text: saved.body,
          time: new Date(saved.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mine: true,
          status: saved.status,
          fileUrl: saved.fileUrl,
          deleted: false
        });
        this.newMsg = '';
        this.pendingFile = null;
        this.pendingFileUrl = null;
      },
      error: (err) => console.error('Failed to send message', err)
    });
  }

  onMsgKey(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMsg();
    }
  }

  confirmDelete(msg: any) {
    this.pendingDeleteMsg = msg;
    this.showDeletePopup = true;
  }

  cancelDelete() {
    this.pendingDeleteMsg = null;
    this.showDeletePopup = false;
  }

  deleteForAll() {
    if (!this.pendingDeleteMsg) return;
    this.messageService.deleteMessageForAll(this.pendingDeleteMsg.id).subscribe({
      next: () => {
        this.pendingDeleteMsg.deleted = true;
        this.pendingDeleteMsg.text = 'message deleted';
        this.pendingDeleteMsg.fileUrl = null;
        this.cancelDelete();
      },
      error: (err) => console.error(err)
    });
  }

  deleteForMe() {
    if (!this.pendingDeleteMsg) return;
    this.messageService.deleteMessageForMe(this.pendingDeleteMsg.id, this.currentUserId).subscribe({
      next: () => {
        this.pendingDeleteMsg.deleted = true;
        this.pendingDeleteMsg.text = 'message deleted';
        this.pendingDeleteMsg.fileUrl = null;
        this.cancelDelete();
      },
      error: (err) => console.error(err)
    });
  }

  getColor(id: number): string {
    const colors = ['#2ABFBF', '#7C5CBF', '#E8622A', '#27AE7A', '#F5A623'];
    return colors[id % colors.length];
  }
}