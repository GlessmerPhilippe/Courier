import { User } from '../types';
import { apiService } from './apiService';

interface LoginResponse {
  user: User;
  token: string;
}

class RealAuthService {
  private readonly STORAGE_KEY = 'mail_app_auth';

  async login(email: string, password: string): Promise<LoginResponse | null> {
    try {
      const response = await apiService.login(email, password);
      
      const user: User = {
        id: response.user.id.toString(),
        email: response.user.email,
        name: response.user.name,
        role: response.user.roles?.includes('ROLE_ADMIN') ? 'admin' : 'user',
        createdAt: new Date(response.user.createdAt),
      };

      const authData = { user, token: response.token };
      
      // Stocker les données d'authentification
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData));
      
      // Configurer le token dans le service API
      apiService.setToken(response.token);
      
      return authData;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  async register(email: string, password: string, name: string): Promise<LoginResponse | null> {
    try {
      await apiService.register(email, password, name);
      
      // Après l'inscription, se connecter automatiquement
      return this.login(email, password);
    } catch (error) {
      console.error('Registration error:', error);
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    apiService.clearToken();
  }

  getCurrentAuth(): LoginResponse | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const authData = JSON.parse(stored);
        // Restaurer le token dans le service API
        if (authData.token) {
          apiService.setToken(authData.token);
        }
        return authData;
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        this.logout();
      }
    }
    return null;
  }

  async refreshProfile(): Promise<User | null> {
    try {
      const profile = await apiService.getProfile();
      
      const user: User = {
        id: profile.id.toString(),
        email: profile.email,
        name: profile.name,
        role: profile.roles?.includes('ROLE_ADMIN') ? 'admin' : 'user',
        createdAt: new Date(profile.createdAt),
      };

      // Mettre à jour les données stockées
      const currentAuth = this.getCurrentAuth();
      if (currentAuth) {
        const updatedAuth = { ...currentAuth, user };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedAuth));
      }

      return user;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      return null;
    }
  }
}

export const realAuthService = new RealAuthService();