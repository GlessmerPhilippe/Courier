const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    // Récupérer le token depuis le localStorage au démarrage
    const authData = localStorage.getItem('mail_app_auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        this.token = parsed.token;
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expiré ou invalide
        this.clearToken();
        localStorage.removeItem('mail_app_auth');
        window.location.href = '/login';
        throw new Error('Authentication required');
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/login_check', {
      method: 'POST',
      body: JSON.stringify({ username: email, password }),
    });
  }

  async register(email: string, password: string, name: string) {
    return this.request<{ message: string; user: any }>('/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async getProfile() {
    return this.request<any>('/profile');
  }

  // Mail endpoints
  async getMails(params: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    search?: string;
    sender?: string;
    recipient?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/mails${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{
      data: any[];
      total: number;
      page: number;
      limit: number;
      pages: number;
    }>(endpoint);
  }

  async getMail(id: string) {
    return this.request<any>(`/mails/${id}`);
  }

  async createMail(mailData: any) {
    return this.request<any>('/mails', {
      method: 'POST',
      body: JSON.stringify(mailData),
    });
  }

  async updateMail(id: string, mailData: any) {
    return this.request<any>(`/mails/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mailData),
    });
  }

  async deleteMail(id: string) {
    return this.request<void>(`/mails/${id}`, {
      method: 'DELETE',
    });
  }

  async getMailStats() {
    return this.request<{
      total: number;
      pending: number;
      in_progress: number;
      completed: number;
      archived: number;
      overdue: number;
    }>('/mails/stats');
  }

  async getOverdueMails() {
    return this.request<any[]>('/mails/overdue');
  }

  // Attachment endpoints
  async uploadAttachment(mailId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/mails/${mailId}/attachments`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse<{
      id: string;
      name: string;
      url: string;
      size: number;
      mimeType: string;
      uploadedAt: string;
    }>(response);
  }

  async downloadAttachment(attachmentId: string) {
    const response = await fetch(`${API_BASE_URL}/attachments/${attachmentId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to download attachment: ${response.status}`);
    }

    return response.blob();
  }

  async deleteAttachment(attachmentId: string) {
    return this.request<void>(`/attachments/${attachmentId}`, {
      method: 'DELETE',
    });
  }

  // Export endpoints
  async exportToCsv(filters: any = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/export/csv${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }

    return response.blob();
  }

  async exportToPdf(filters: any = {}) {
    const searchParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/export/pdf${queryString ? `?${queryString}` : ''}`;
    
    return this.request<{
      mails: any[];
      stats: any;
      exportDate: string;
      user: string;
    }>(endpoint);
  }
}

export const apiService = new ApiService();