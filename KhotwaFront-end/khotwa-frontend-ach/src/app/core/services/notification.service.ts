import { Injectable } from '@angular/core';

export interface Notification {
  id: string; titre: string; message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: Date; lu: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _notifs: Notification[] = [
    { id:'n1', titre:'SLA Alert', message:'Task "Prototype UI" blocked for 16 days', type:'warning', date:new Date(), lu:false },
    { id:'n2', titre:'Deadline demain', message:'Livraison des maquettes — 24h restantes', type:'error', date:new Date(), lu:false },
    { id:'n3', titre:'Validation required', message:'Sara submitted a task for validation', type:'info', date:new Date(), lu:false },
  ];

  notifs() { return this._notifs; }
  nonLus() { return this._notifs.filter(n => !n.lu).length; }
  markAllRead() { this._notifs = this._notifs.map(n => ({ ...n, lu: true })); }
  markRead(id: string) { this._notifs = this._notifs.map(n => n.id === id ? { ...n, lu: true } : n); }
}
