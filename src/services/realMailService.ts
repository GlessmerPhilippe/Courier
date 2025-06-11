import { Mail, MailFilter, MailType, MailStatus, Attachment } from '../types';
import { apiService } from './apiService';

class RealMailService {
  async getAllMails(): Promise<Mail[]> {
    try {
      const response = await apiService.getMails();
      return this.transformMails(response.data);
    } catch (error) {
      console.error('Error fetching mails:', error);
      throw error;
    }
  }

  async getMailById(id: string): Promise<Mail | null> {
    try {
      const mail = await apiService.getMail(id);
      return this.transformMail(mail);
    } catch (error) {
      console.error('Error fetching mail:', error);
      return null;
    }
  }

  async createMail(mailData: Omit<Mail, 'id' | 'updatedAt'>): Promise<Mail> {
    try {
      const apiData = this.transformMailForApi(mailData);
      const response = await apiService.createMail(apiData);
      return this.transformMail(response);
    } catch (error) {
      console.error('Error creating mail:', error);
      throw error;
    }
  }

  async updateMail(id: string, updates: Partial<Mail>): Promise<Mail | null> {
    try {
      const apiData = this.transformMailForApi(updates);
      const response = await apiService.updateMail(id, apiData);
      return this.transformMail(response);
    } catch (error) {
      console.error('Error updating mail:', error);
      return null;
    }
  }

  async deleteMail(id: string): Promise<boolean> {
    try {
      await apiService.deleteMail(id);
      return true;
    } catch (error) {
      console.error('Error deleting mail:', error);
      return false;
    }
  }

  async searchMails(filter: MailFilter): Promise<Mail[]> {
    try {
      const params = {
        type: filter.type,
        status: filter.status,
        sender: filter.sender,
        recipient: filter.recipient,
        search: filter.search,
        dateFrom: filter.dateFrom?.toISOString().split('T')[0],
        dateTo: filter.dateTo?.toISOString().split('T')[0],
      };

      const response = await apiService.getMails(params);
      return this.transformMails(response.data);
    } catch (error) {
      console.error('Error searching mails:', error);
      throw error;
    }
  }

  async uploadAttachment(file: File, mailId?: string): Promise<Attachment> {
    if (!mailId) {
      throw new Error('Mail ID is required for attachment upload');
    }

    try {
      const response = await apiService.uploadAttachment(mailId, file);
      return {
        id: response.id,
        name: response.name,
        url: response.url,
        type: response.mimeType,
        size: response.size,
        uploadedAt: new Date(response.uploadedAt),
      };
    } catch (error) {
      console.error('Error uploading attachment:', error);
      throw error;
    }
  }

  async getStats() {
    try {
      return await apiService.getMailStats();
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }

  async getOverdueMails(): Promise<Mail[]> {
    try {
      const mails = await apiService.getOverdueMails();
      return this.transformMails(mails);
    } catch (error) {
      console.error('Error fetching overdue mails:', error);
      throw error;
    }
  }

  // Transform methods
  private transformMails(apiMails: any[]): Mail[] {
    return apiMails.map(mail => this.transformMail(mail));
  }

  private transformMail(apiMail: any): Mail {
    return {
      id: apiMail.id.toString(),
      type: apiMail.type as MailType,
      sender: apiMail.sender,
      recipient: apiMail.recipient,
      receivedDate: new Date(apiMail.receivedDate),
      sentDate: apiMail.sentDate ? new Date(apiMail.sentDate) : undefined,
      status: apiMail.status as MailStatus,
      subject: apiMail.subject,
      notes: apiMail.notes,
      attachments: apiMail.attachments ? apiMail.attachments.map((att: any) => ({
        id: att.id.toString(),
        name: att.name,
        url: att.url,
        type: att.mimeType,
        size: att.size,
        uploadedAt: new Date(att.uploadedAt),
      })) : [],
      dueDate: apiMail.dueDate ? new Date(apiMail.dueDate) : undefined,
      actionRequired: apiMail.actionRequired,
      createdBy: apiMail.createdBy?.id?.toString() || '1',
      updatedAt: new Date(apiMail.updatedAt),
    };
  }

  private transformMailForApi(mail: any): any {
    const apiMail: any = {
      type: mail.type,
      sender: mail.sender,
      recipient: mail.recipient,
      status: mail.status,
      subject: mail.subject,
      notes: mail.notes,
      actionRequired: mail.actionRequired,
    };

    if (mail.receivedDate) {
      apiMail.receivedDate = mail.receivedDate instanceof Date 
        ? mail.receivedDate.toISOString()
        : mail.receivedDate;
    }

    if (mail.sentDate) {
      apiMail.sentDate = mail.sentDate instanceof Date 
        ? mail.sentDate.toISOString()
        : mail.sentDate;
    }

    if (mail.dueDate) {
      apiMail.dueDate = mail.dueDate instanceof Date 
        ? mail.dueDate.toISOString()
        : mail.dueDate;
    }

    return apiMail;
  }
}

export const realMailService = new RealMailService();