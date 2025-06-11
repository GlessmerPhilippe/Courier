import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, User, FileText, Download } from 'lucide-react';
import { Mail } from '../../types';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

interface MailDetailProps {
  mail: Mail;
  onClose: () => void;
}

const MailDetail: React.FC<MailDetailProps> = ({ mail, onClose }) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'fr' ? fr : enUS;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{t('common.mailDetails')}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Type */}
          <div className="flex flex-wrap gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(mail.type)}`}>
              {t(`mailType.${mail.type}`)}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(mail.status)}`}>
              {t(`mailStatus.${mail.status}`)}
            </span>
          </div>

          {/* Subject */}
          <h3 className="text-2xl font-bold text-gray-900">{mail.subject}</h3>

          {/* Sender and Recipient */}
          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-5 h-5" />
            <span>{mail.sender} → {mail.recipient}</span>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <div>
                <span className="block text-sm font-medium">Received Date</span>
                <span>{format(new Date(mail.receivedDate), 'PPp', { locale })}</span>
              </div>
            </div>
            {mail.sentDate && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-5 h-5" />
                <div>
                  <span className="block text-sm font-medium">Sent Date</span>
                  <span>{format(new Date(mail.sentDate), 'PPp', { locale })}</span>
                </div>
              </div>
            )}
          </div>

          {/* Due Date if exists */}
          {mail.dueDate && (
            <div className="flex items-center gap-2 text-orange-600">
              <Calendar className="w-5 h-5" />
              <div>
                <span className="block text-sm font-medium">Due Date</span>
                <span>{format(new Date(mail.dueDate), 'PPp', { locale })}</span>
              </div>
            </div>
          )}

          {/* Action Required if exists */}
          {mail.actionRequired && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-1">Action Required</h4>
              <p className="text-yellow-700">{mail.actionRequired}</p>
            </div>
          )}

          {/* Notes if exists */}
          {mail.notes && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-1">Notes</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{mail.notes}</p>
            </div>
          )}

          {/* Attachments */}
          {mail.attachments && mail.attachments.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Attachments</h4>
              <div className="space-y-4">
                {mail.attachments.map((attachment) => (
                  <div key={attachment.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Attachment Header */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">{attachment.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <a
                        href={attachment.url}
                        download
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                    
                    {/* Embedded Content */}
                    <div className="p-4">
                      {attachment.type.startsWith('image/') ? (
                        <div className="text-center">
                          <img 
                            src={attachment.url} 
                            alt={attachment.name}
                            className="max-w-full h-auto rounded-lg shadow-sm"
                            style={{ maxHeight: '400px' }}
                          />
                        </div>
                      ) : attachment.type === 'application/pdf' ? (
                        <iframe
                          src={attachment.url}
                          title={attachment.name}
                          className="w-full h-[500px] rounded-lg border border-gray-200"
                        />
                      ) : attachment.type.startsWith('text/') ? (
                        <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                          <iframe
                            src={attachment.url}
                            title={attachment.name}
                            className="w-full h-48 border-0"
                          />
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">Preview not available for this file type</p>
                          <p className="text-xs">Click download to view the file</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MailDetail;
