// Configuration pour basculer entre les services mock et réels
const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true' || 
                     import.meta.env.VITE_API_URL !== undefined;

console.log('🔧 API Configuration:', {
  USE_REAL_API,
  API_URL: import.meta.env.VITE_API_URL,
  VITE_USE_REAL_API: import.meta.env.VITE_USE_REAL_API
});

// Services mock (par défaut)
import { authService as mockAuthService } from './authService';
import { mailService as mockMailService } from './mailService';

// Services réels
import { realAuthService } from './realAuthService';
import { realMailService } from './realMailService';

// Export conditionnel basé sur la configuration
export const authService = USE_REAL_API ? realAuthService : mockAuthService;
export const mailService = USE_REAL_API ? realMailService : mockMailService;

// Re-export des services individuels
export { mockAuthService, mockMailService, realAuthService, realMailService };
export { apiService } from './apiService';

// Fonction utilitaire pour vérifier si on utilise l'API réelle
export const isUsingRealAPI = () => USE_REAL_API;

// Fonction pour basculer manuellement (utile pour le développement)
export const switchToRealAPI = () => {
  localStorage.setItem('force_real_api', 'true');
  window.location.reload();
};

export const switchToMockAPI = () => {
  localStorage.removeItem('force_real_api');
  window.location.reload();
};