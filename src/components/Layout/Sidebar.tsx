import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Mail, 
  Plus, 
  Bell, 
  Download, 
  LogOut,
  Settings,
  Globe
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import ApiStatus from './ApiStatus';

const Sidebar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { logout, user } = useAuth();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'en' : 'fr';
    i18n.changeLanguage(newLang);
  };

  const navItems = [
    { path: '/', icon: Home, label: t('nav.dashboard') },
    { path: '/mails', icon: Mail, label: t('nav.mails') },
    { path: '/add-mail', icon: Plus, label: t('nav.add') },
    { path: '/notifications', icon: Bell, label: t('nav.notifications') },
    { path: '/export', icon: Download, label: t('nav.export') },
  ];

  return (
    <div className="bg-white w-64 min-h-screen border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Mail className="w-6 h-6 text-blue-600" />
          Courriers Manager
        </h1>
        <p className="text-sm text-gray-600 mt-1">{user?.name}</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-3">
        {/* Statut de l'API */}
        <ApiStatus />
        
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 w-full"
        >
          <Globe className="w-5 h-5" />
          {i18n.language === 'fr' ? 'English' : 'Français'}
        </button>
        
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5" />
          {t('nav.logout')}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;