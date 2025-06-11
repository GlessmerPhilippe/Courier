import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Clock, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { Mail as MailType } from '../../types';
import { mailService } from '../../services/mailService';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

const Dashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [mails, setMails] = useState<MailType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMails = async () => {
      try {
        const data = await mailService.getAllMails();
        setMails(data);
      } catch (error) {
        console.error('Error loading mails:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMails();
  }, []);

  const stats = {
    total: mails.length,
    pending: mails.filter(m => m.status === 'pending').length,
    completed: mails.filter(m => m.status === 'completed').length,
    overdue: mails.filter(m => m.dueDate && new Date(m.dueDate) < new Date() && m.status !== 'completed').length,
  };

  const recentMails = mails
    .sort((a, b) => new Date(b.receivedDate).getTime() - new Date(a.receivedDate).getTime())
    .slice(0, 5);

  const locale = i18n.language === 'fr' ? fr : enUS;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'in_progress': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'archived': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'invoice': return 'text-red-600 bg-red-50';
      case 'administrative': return 'text-purple-600 bg-purple-50';
      case 'bank': return 'text-green-600 bg-green-50';
      case 'insurance': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <TrendingUp className="w-4 h-4" />
          {format(new Date(), 'PPP', { locale })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('dashboard.totalMails')}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('dashboard.pendingMails')}</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('dashboard.completedMails')}</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('dashboard.overdueMails')}</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.overdue}</p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Mails */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.recentMails')}</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            {t('dashboard.viewAll')}
          </button>
        </div>
        
        <div className="divide-y divide-gray-100">
          {recentMails.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {t('common.noData')}
            </div>
          ) : (
            recentMails.map((mail) => (
              <div key={mail.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(mail.type)}`}>
                        {t(`mailType.${mail.type}`)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(mail.status)}`}>
                        {t(`mailStatus.${mail.status}`)}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 truncate">{mail.subject}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {mail.sender} → {mail.recipient}
                    </p>
                    {mail.notes && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{mail.notes}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-500 ml-4 flex-shrink-0">
                    {format(new Date(mail.receivedDate), 'PPp', { locale })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;