import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message, Notification, Page } from '../models/message.model';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  sendMessage(message: Partial<Message>): Observable<Message> {
    return this.http.post<Message>(`${this.apiUrl}/messages`, message);
  }

  getInbox(receiverId: number, page = 0, size = 10): Observable<Page<Message>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Message>>(`${this.apiUrl}/messages/inbox/${receiverId}`, { params });
  }

  getSent(senderId: number, page = 0, size = 10): Observable<Page<Message>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Message>>(`${this.apiUrl}/messages/sent/${senderId}`, { params });
  }

  getActiveInbox(receiverId: number, page = 0, size = 10): Observable<Page<Message>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Message>>(`${this.apiUrl}/messages/inbox/${receiverId}/active`, { params });
  }

  getInboxByType(receiverId: number, type: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${this.apiUrl}/messages/inbox/${receiverId}/filter`, { params: { type } });
  }

  updateStatus(id: number, status: string): Observable<Message> {
    return this.http.patch<Message>(`${this.apiUrl}/messages/${id}/status`, null, { params: { status } });
  }

  archiveMessage(id: number): Observable<Message> {
    return this.http.patch<Message>(`${this.apiUrl}/messages/${id}/archive`, null);
  }

  deleteMessage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/messages/${id}`);
  }

  getNotifications(recipientId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/notifications/${recipientId}`);
  }

  getUnreadNotifications(recipientId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/notifications/${recipientId}/unread`);
  }

  markNotificationAsRead(id: number): Observable<Notification> {
    return this.http.patch<Notification>(`${this.apiUrl}/notifications/${id}/read`, null);
  }

  uploadFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/files/upload`, formData, { responseType: 'text' });
  }

  markBulkNotificationsRead(ids: number[]): Observable<any> {
    return this.http.patch(`${this.apiUrl}/notifications/bulk/read`, ids);
  }

  markBulkNotificationsUnread(ids: number[]): Observable<any> {
    return this.http.patch(`${this.apiUrl}/notifications/bulk/unread`, ids);
  }

  deleteBulkNotifications(ids: number[]): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/notifications/bulk/delete`, { body: ids });
  }

  deleteMessageForAll(id: number): Observable<Message> {
    return this.http.delete<Message>(`${this.apiUrl}/messages/${id}/delete-for-all`);
  }

  deleteMessageForMe(id: number, userId: number): Observable<Message> {
    return this.http.delete<Message>(`${this.apiUrl}/messages/${id}/delete-for-me`, { params: { userId } });
  }

  announceOnline(userId: number): Observable<number[]> {
    return this.http.post<number[]>(`${this.apiUrl}/messages/presence/${userId}/online`, null);
  }

  announceOffline(userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/messages/presence/${userId}/offline`, null);
  }

  getOnlineUsers(): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/messages/presence/all-online`);
  }
}