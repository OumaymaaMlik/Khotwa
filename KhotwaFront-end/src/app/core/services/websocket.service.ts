import { Injectable } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject } from 'rxjs';
import { Message, Notification } from '../models/message.model';

export interface TypingEvent {
  userId: number;
  typing: boolean;
}

export interface StatusEvent {
  userId: number;
  online: boolean;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService {

  private client: Client;
  private subscriptions: StompSubscription[] = [];

  newMessage$ = new Subject<Message>();
  messageUpdate$ = new Subject<Message>();
  newNotification$ = new Subject<Notification>();
  typing$ = new Subject<TypingEvent>();
  status$ = new Subject<StatusEvent>();

  constructor() {
    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      onDisconnect: () => console.log('WebSocket disconnected'),
      onStompError: (frame) => console.error('WebSocket error:', frame)
    });
  }

  onConnected?: (userId: number) => void;

  connect(userId: number) {
    this.client.onConnect = () => {
      this.subscriptions.push(
        this.client.subscribe(`/topic/messages/${userId}`, (msg) => {
          const message = JSON.parse(msg.body);
          if (message.deletedForAll === true ||
              (message.deletedForUsers !== null) ||
              (message.status !== 'PENDING')) {
            this.messageUpdate$.next(message);
          } else {
            this.newMessage$.next(message);
          }
        })
      );

      this.subscriptions.push(
        this.client.subscribe(`/topic/notifications/${userId}`, (msg) => {
          this.newNotification$.next(JSON.parse(msg.body));
        })
      );

      this.subscriptions.push(
        this.client.subscribe(`/topic/typing/${userId}`, (msg) => {
          this.typing$.next(JSON.parse(msg.body));
        })
      );

      this.subscriptions.push(
        this.client.subscribe(`/topic/status`, (msg) => {
          this.status$.next(JSON.parse(msg.body));
        })
      );

      if (this.onConnected) this.onConnected(userId);
    };

    this.client.activate();
  }

  disconnect() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
    this.client.deactivate();
  }

  sendTyping(senderId: number, receiverId: number, isTyping: boolean) {
    if (this.client.connected) {
      this.client.publish({
        destination: '/app/typing',
        body: JSON.stringify({ senderId, receiverId, typing: isTyping })
      });
    }
  }

  sendOnlineStatus(userId: number, isOnline: boolean) {
    if (this.client.connected) {
      this.client.publish({
        destination: '/app/status',
        body: JSON.stringify({ userId, online: isOnline })
      });
    }
  }
}