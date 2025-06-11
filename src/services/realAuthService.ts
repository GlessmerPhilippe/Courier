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
      console.log('Attempting login with:', { email });
      const response = await apiService.login(email, password);
      console.log('Login response received:', response);
      
      // Set token first for API calls
      apiService.setToken(response.token);
      
      // Try to get user profile from API first
      try {
        console.log('Attempting to fetch profile...');
        const profile = await apiService.getProfile();
        console.log('Profile fetched successfully:', profile);
        
        const user: User = {
          id: profile.id?.toString() || '1',
          email: profile.email || email,
          name: profile.name || email.split('@')[0],
          role: profile.roles?.includes('ROLE_ADMIN') ? 'admin' : 'user',
          createdAt: new Date(profile.createdAt || Date.now()),
        };

        const authData = { user, token: response.token };
        
        // Store auth data
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData));
        
        return authData;
      } catch (profileError) {
        console.warn('Profile fetch failed, falling back to JWT decoding:', profileError);
        
        // Fallback: decode JWT token to get user information
        try {
          const tokenPayload = JSON.parse(atob(response.token.split('.')[1]));
          console.log('JWT payload:', tokenPayload);
          
          const user: User = {
            id: '1', // Default ID since JWT doesn't contain user ID
            email: tokenPayload.username || email,
            name: tokenPayload.username?.split('@')[0] || email.split('@')[0],
            role: tokenPayload.roles?.includes('ROLE_ADMIN') ? 'admin' : 'user',
            createdAt: new Date(),
          };

          const authData = { user, token: response.token };
          
          // Store auth data
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData));
          
          return authData;
        } catch (jwtError) {
          console.error('Failed to decode JWT:', jwtError);
          
          // Final fallback: create user with basic info
          const user: User = {
            id: '1',
            email: email,
            name: email.split('@')[0],
            role: 'user',
            createdAt: new Date(),
          };

          const authData = { user, token: response.token };
          
          // Store auth data
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authData));
          
          return authData;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  async register(email: string, password: string, name: string): Promise<LoginResponse | null> {
    try {
      await apiService.register(email, password, name);
      
      // After registration, login automatically
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
        // Restore token in API service
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
        id: profile.id?.toString() || '1',
        email: profile.email,
        name: profile.name,
        role: profile.roles?.includes('ROLE_ADMIN') ? 'admin' : 'user',
        createdAt: new Date(profile.createdAt || Date.now()),
      };

      // Update stored data
      const currentAuth = this.getCurrentAuth();
      if (currentAuth) {
        const updatedAuth = { ...currentAuth, user };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedAuth));
      }

      return user;
    } catch (error) {
      console.error('Error refreshing profile:', error);
      // Return current user from stored auth data instead of null
      const currentAuth = this.getCurrentAuth();
      return currentAuth?.user || null;
    }
  }
}

export const realAuthService = new RealAuthService();
