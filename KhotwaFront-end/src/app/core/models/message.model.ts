export type MessageStatus = 'PENDING' | 'READ' | 'RESOLVED' | 'ARCHIVED';
export type MessageType = 'DIRECT_MESSAGE' | 'SUPPORT_TICKET';

export interface Message {
  id: number;
  subject: string;
  body: string;
  senderId: number;
  receiverId: number;
  type: MessageType;
  status: MessageStatus;
  createdAt: Date;
  updatedAt: Date;
  fileUrl?: string;
  deletedForAll?: boolean;
  deletedForUsers?: string;
}

export interface Notification {
  id: number;
  recipientId: number;
  message: string;
  type: 'NEW_MESSAGE' | 'STATUS_UPDATED' | 'TICKET_RESOLVED';
  createdAt: Date;
  read: boolean;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
  first: boolean;
}