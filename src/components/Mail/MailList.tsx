import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye,
  Calendar,
  User,
  Tag
} from 'lucide-react';
import { Mail, MailFilter } from '../../types';
import { mailService } from '../../services/mailService';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const MailList: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [mails, setMails] = useState<Mail[]>([]);
  const [filteredMails, setFilteredMails] = useState<Mail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<MailFilter>({});
  const [showFilters, setShowFilters] = useState(false);

  const locale = i18n.language === 'fr' ? fr : enUS;

  useEffect(() => {
    loadMails();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [mails, searchTerm, filters]);

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

  const applyFilters = async () => {
    const filter: MailFilter = {
      ...filters,
      search: searchTerm || undefined,
    };

    try {
      const filtered = await mailService.searchMails(filter);
      setFilteredMails(filtered);
    } catch (error) {
      console.error('Error filtering mails:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this mail?')) {
      try {
        await mailService.deleteMail(id);
        await loadMails();
      } catch (error) {
        console.error('Error deleting mail:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'in_progress': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'completed': return 'text-green-700 bg-green-100 border-green-200';
      case 'archived': return 'text-gray-700 bg-gray-100 border-gray-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'invoice': return 'text-red-700 bg-red-100 border-red-200';
      case 'administrative': return 'text-purple-700 bg-purple-100 border-purple-200';
      case 'bank': return 'text-green-700 bg-green-100 border-green-200';
      case 'insurance': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'utility': return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'medical': return 'text-pink-700 bg-pink-100 border-pink-200';
      case 'legal': return 'text-indigo-700 bg-indigo-100 border-indigo-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
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
        <h1 className="text-3xl font-bold text-gray-900">{t('nav.mails')}</h1>
        <Link
          to="/add-mail"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('nav.add')}
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('common.search')}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            {t('common.filter')}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filters.type || ''}
              onChange={(e) => setFilters({ ...filters, type: e.target.value as any || undefined })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">{t('common.type')}</option>
              <option value="invoice">{t('mailType.invoice')}</option>
              <option value="letter">{t('mailType.letter')}</option>
              <option value="administrative">{t('mailType.administrative')}</option>
              <option value="bank">{t('mailType.bank')}</option>
              <option value="insurance">{t('mailType.insurance')}</option>
              <option value="utility">{t('mailType.utility')}</option>
              <option value="medical">{t('mailType.medical')}</option>
              <option value="legal">{t('mailType.legal')}</option>
              <option value="other">{t('mailType.other')}</option>
            </select>

            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">{t('common.status')}</option>
              <option value="pending">{t('mailStatus.pending')}</option>
              <option value="in_progress">{t('mailStatus.in_progress')}</option>
              <option value="completed">{t('mailStatus.completed')}</option>
              <option value="archived">{t('mailStatus.archived')}</option>
            </select>

            <input
              type="text"
              value={filters.sender || ''}
              onChange={(e) => setFilters({ ...filters, sender: e.target.value || undefined })}
              placeholder={t('common.sender')}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        )}
      </div>

      {/* Mail List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredMails.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {t('common.noData')}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredMails.map((mail) => (
              <div key={mail.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(mail.type)}`}>
                        {t(`mailType.${mail.type}`)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(mail.status)}`}>
                        {t(`mailStatus.${mail.status}`)}
                      </span>
                      {mail.dueDate && new Date(mail.dueDate) < new Date() && mail.status !== 'completed' && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium text-red-700 bg-red-100 border border-red-200">
                          Overdue
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{mail.subject}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{mail.sender} → {mail.recipient}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(mail.receivedDate), 'PPp', { locale })}</span>
                      </div>
                    </div>

                    {mail.dueDate && (
                      <div className="flex items-center gap-2 text-sm text-orange-600 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {format(new Date(mail.dueDate), 'PPp', { locale })}</span>
                      </div>
                    )}

                    {mail.notes && (
                      <p className="text-sm text-gray-600 line-clamp-2">{mail.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(mail.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MailList;