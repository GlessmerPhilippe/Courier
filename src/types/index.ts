export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface Mail {
  id: string;
  type: MailType;
  sender: string;
  recipient: string;
  receivedDate: Date;
  sentDate?: Date;
  status: MailStatus;
  subject: string;
  notes?: string;
  attachments: Attachment[];
  dueDate?: Date;
  actionRequired?: string;
  createdBy: string;
  updatedAt: Date;
}

export type MailType = 
  | 'invoice' 
  | 'letter' 
  | 'administrative' 
  | 'bank' 
  | 'insurance' 
  | 'utility' 
  | 'medical' 
  | 'legal' 
  | 'other';

export type MailStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'completed' 
  | 'archived';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface MailFilter {
  type?: MailType;
  status?: MailStatus;
  sender?: string;
  recipient?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Notification {
  id: string;
  mailId: string;
  message: string;
  type: 'reminder' | 'overdue' | 'info';
  createdAt: Date;
  read: boolean;
}