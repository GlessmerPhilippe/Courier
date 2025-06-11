// Configuration pour basculer entre les services mock et réels
const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true' || 
                     import.meta.env.VITE_API_URL !== undefined;

// Services mock (par défaut)
export { authService as mockAuthService } from './authService';
export { mailService as mockMailService } from './mailService';

// Services réels
export { realAuthService } from './realAuthService';
export { realMailService } from './realMailService';
export { apiService } from './apiService';

// Export conditionnel basé sur la configuration
export const authService = USE_REAL_API 
  ? await import('./realAuthService').then(m => m.realAuthService)
  : await import('./authService').then(m => m.authService);

export const mailService = USE_REAL_API
  ? await import('./realMailService').then(m => m.realMailService)
  : await import('./mailService').then(m => m.mailService);

// Fonction utilitaire pour vérifier si on utilise l'API réelle
export const isUsingRealAPI = () => USE_REAL_API;

// Fonction pour basculer manuellement (utile pour le développement)
export const switchToRealAPI = () => {
  window.location.reload(); // Recharger pour appliquer les changements
};

export const switchToMockAPI = () => {
  window.location.reload(); // Recharger pour appliquer les changements
};