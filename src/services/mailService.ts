import { Mail, MailFilter, MailType, MailStatus, Attachment } from '../types';

class MailService {
  private mails: Mail[] = [];

  async getAllMails(): Promise<Mail[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.mails];
  }

  async getMailById(id: string): Promise<Mail | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mails.find(mail => mail.id === id) || null;
  }

  async createMail(mailData: Omit<Mail, 'id' | 'updatedAt'>): Promise<Mail> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newMail: Mail = {
      ...mailData,
      id: Date.now().toString(),
      updatedAt: new Date(),
    };
    
    this.mails.unshift(newMail);
    return newMail;
  }

  async updateMail(id: string, updates: Partial<Mail>): Promise<Mail | null> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = this.mails.findIndex(mail => mail.id === id);
    if (index === -1) return null;
    
    this.mails[index] = {
      ...this.mails[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    return this.mails[index];
  }

  async deleteMail(id: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.mails.findIndex(mail => mail.id === id);
    if (index === -1) return false;
    
    this.mails.splice(index, 1);
    return true;
  }

  async searchMails(filter: MailFilter): Promise<Mail[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    let filtered = [...this.mails];
    
    if (filter.type) {
      filtered = filtered.filter(mail => mail.type === filter.type);
    }
    
    if (filter.status) {
      filtered = filtered.filter(mail => mail.status === filter.status);
    }
    
    if (filter.sender) {
      filtered = filtered.filter(mail => 
        mail.sender.toLowerCase().includes(filter.sender!.toLowerCase())
      );
    }
    
    if (filter.recipient) {
      filtered = filtered.filter(mail => 
        mail.recipient.toLowerCase().includes(filter.recipient!.toLowerCase())
      );
    }
    
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      filtered = filtered.filter(mail => 
        mail.subject.toLowerCase().includes(searchTerm) ||
        mail.sender.toLowerCase().includes(searchTerm) ||
        mail.recipient.toLowerCase().includes(searchTerm) ||
        (mail.notes && mail.notes.toLowerCase().includes(searchTerm))
      );
    }
    
    if (filter.dateFrom) {
      filtered = filtered.filter(mail => mail.receivedDate >= filter.dateFrom!);
    }
    
    if (filter.dateTo) {
      filtered = filtered.filter(mail => mail.receivedDate <= filter.dateTo!);
    }
    
    return filtered;
  }

  async uploadAttachment(file: File, mailId?: string): Promise<Attachment> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock file upload
    const attachment: Attachment = {
      id: Date.now().toString(),
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      size: file.size,
      uploadedAt: new Date(),
    };
    
    // If mailId is provided, add the attachment to the mail
    if (mailId) {
      const mailIndex = this.mails.findIndex(mail => mail.id === mailId);
      if (mailIndex !== -1) {
        this.mails[mailIndex].attachments.push(attachment);
      }
    }
    
    return attachment;
  }
}

export const mailService = new MailService();