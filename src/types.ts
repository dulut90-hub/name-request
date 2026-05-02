export type RequestStatus = 'pending' | 'accepted' | 'rejected';

export interface SourceRequest {
  id: string;
  name: string;
  webType: string;
  status: RequestStatus;
  adminNote?: string;
  secretKey: string;
  imageUrl?: string;
  userId: string;
  createdAt: any;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  createdAt: any;
}

export interface Announcement {
  id: string;
  content: string;
  imageUrl?: string;
  createdAt: any;
}

export interface Portfolio {
  id: string;
  name: string;
  url: string;
  features: string;
  adminNote?: string;
  adminName: string;
  imageUrl?: string;
  createdAt: any;
}
