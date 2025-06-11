import { User } from '../types';

interface LoginResponse {
  user: User;
  token: string;
}

class AuthService {
  private readonly STORAGE_KEY = 'mail_app_auth';

  async login(email: string, password: string): Promise<LoginResponse | null> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock authentication - in real app, this would be API call
    if (email === 'admin@family.com' && password === 'admin123') {
      const user: User = {
        id: '1',
        email: 'admin@family.com',
        name: 'Family Admin',
        role: 'admin',
        createdAt: new Date(),
      };
      const token = 'mock-jwt-token-admin';
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ user, token }));
      return { user, token };
    }
    
    if (email === 'user@family.com' && password === 'user123') {
      const user: User = {
        id: '2',
        email: 'user@family.com',
        name: 'Family User',
        role: 'user',
        createdAt: new Date(),
      };
      const token = 'mock-jwt-token-user';
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ user, token }));
      return { user, token };
    }
    
    return null;
  }

  async register(email: string, password: string, name: string): Promise<LoginResponse | null> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock registration
    if (email && password && name) {
      const user: User = {
        id: Date.now().toString(),
        email,
        name,
        role: 'user',
        createdAt: new Date(),
      };
      const token = `mock-jwt-token-${user.id}`;
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ user, token }));
      return { user, token };
    }
    
    return null;
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getCurrentAuth(): LoginResponse | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        this.logout();
      }
    }
    return null;
  }
}

export const authService = new AuthService();