import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      'nav.dashboard': 'Dashboard',
      'nav.mails': 'Mail',
      'nav.add': 'Add Mail',
      'nav.notifications': 'Notifications',
      'nav.export': 'Export',
      'nav.logout': 'Logout',
      
      // Auth
      'auth.login': 'Login',
      'auth.register': 'Register',
      'auth.email': 'Email',
      'auth.password': 'Password',
      'auth.name': 'Full Name',
      'auth.loginButton': 'Sign In',
      'auth.registerButton': 'Create Account',
      'auth.switchToRegister': "Don't have an account? Register",
      'auth.switchToLogin': 'Already have an account? Login',
      'auth.loginError': 'Invalid credentials',
      
      // Dashboard
      'dashboard.title': 'Mail Management Dashboard',
      'dashboard.totalMails': 'Total Mail',
      'dashboard.pendingMails': 'Pending',
      'dashboard.completedMails': 'Completed',
      'dashboard.overdueMails': 'Overdue',
      'dashboard.recentMails': 'Recent Mail',
      'dashboard.viewAll': 'View All',
      
      // Mail Types
      'mailType.invoice': 'Invoice',
      'mailType.letter': 'Letter',
      'mailType.administrative': 'Administrative',
      'mailType.bank': 'Bank',
      'mailType.insurance': 'Insurance',
      'mailType.utility': 'Utility',
      'mailType.medical': 'Medical',
      'mailType.legal': 'Legal',
      'mailType.other': 'Other',
      
      // Mail Status
      'mailStatus.pending': 'Pending',
      'mailStatus.in_progress': 'In Progress',
      'mailStatus.completed': 'Completed',
      'mailStatus.archived': 'Archived',
      
      // Common
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.export': 'Export',
      'common.loading': 'Loading...',
      'common.noData': 'No data available',
      'common.actions': 'Actions',
      'common.date': 'Date',
      'common.status': 'Status',
      'common.type': 'Type',
      'common.sender': 'Sender',
      'common.recipient': 'Recipient',
    }
  },
  fr: {
    translation: {
      // Navigation
      'nav.dashboard': 'Tableau de bord',
      'nav.mails': 'Courrier',
      'nav.add': 'Ajouter',
      'nav.notifications': 'Notifications',
      'nav.export': 'Export',
      'nav.logout': 'Déconnexion',
      
      // Auth
      'auth.login': 'Connexion',
      'auth.register': 'Inscription',
      'auth.email': 'Email',
      'auth.password': 'Mot de passe',
      'auth.name': 'Nom complet',
      'auth.loginButton': 'Se connecter',
      'auth.registerButton': 'Créer un compte',
      'auth.switchToRegister': "Pas de compte ? S'inscrire",
      'auth.switchToLogin': 'Déjà un compte ? Se connecter',
      'auth.loginError': 'Identifiants invalides',
      
      // Dashboard
      'dashboard.title': 'Gestion du Courrier Familial',
      'dashboard.totalMails': 'Total Courrier',
      'dashboard.pendingMails': 'En attente',
      'dashboard.completedMails': 'Traités',
      'dashboard.overdueMails': 'En retard',
      'dashboard.recentMails': 'Courrier Récent',
      'dashboard.viewAll': 'Voir tout',
      
      // Mail Types
      'mailType.invoice': 'Facture',
      'mailType.letter': 'Lettre',
      'mailType.administrative': 'Administratif',
      'mailType.bank': 'Banque',
      'mailType.insurance': 'Assurance',
      'mailType.utility': 'Services',
      'mailType.medical': 'Médical',
      'mailType.legal': 'Juridique',
      'mailType.other': 'Autre',
      
      // Mail Status
      'mailStatus.pending': 'En attente',
      'mailStatus.in_progress': 'En cours',
      'mailStatus.completed': 'Traité',
      'mailStatus.archived': 'Archivé',
      
      // Common
      'common.save': 'Enregistrer',
      'common.cancel': 'Annuler',
      'common.delete': 'Supprimer',
      'common.edit': 'Modifier',
      'common.search': 'Rechercher',
      'common.filter': 'Filtrer',
      'common.export': 'Exporter',
      'common.loading': 'Chargement...',
      'common.noData': 'Aucune donnée disponible',
      'common.actions': 'Actions',
      'common.date': 'Date',
      'common.status': 'Statut',
      'common.type': 'Type',
      'common.sender': 'Expéditeur',
      'common.recipient': 'Destinataire',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;