import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  X, 
  Upload, 
  FileText, 
  Calendar,
  User,
  Mail as MailIcon,
  Download,
  Trash2
} from 'lucide-react';
import { Mail, MailType, MailStatus, Attachment } from '../../types';
import { mailService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';

interface EditMailProps {
  mail: Mail;
  onClose: () => void;
  onUpdate: (updatedMail: Mail) => void;
}

const EditMail: React.FC<EditMailProps> = ({ mail, onClose, onUpdate }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    type: mail.type as MailType,
    sender: mail.sender,
    recipient: mail.recipient,
    receivedDate: new Date(mail.receivedDate).toISOString().split('T')[0],
    sentDate: mail.sentDate ? new Date(mail.sentDate).toISOString().split('T')[0] : '',
    status: mail.status as MailStatus,
    subject: mail.subject,
    notes: mail.notes || '',
    dueDate: mail.dueDate ? new Date(mail.dueDate).toISOString().split('T')[0] : '',
    actionRequired: mail.actionRequired || '',
  });
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(mail.attachments || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (file.size > maxSize) {
        alert(`File ${file.name} is too large (max 10MB)`);
        return false;
      }

      if (!allowedTypes.includes(file.type)) {
        alert(`File type ${file.type} is not allowed`);
        return false;
      }

      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = async (attachmentId: string) => {
    if (!window.confirm('Are you sure you want to delete this attachment?')) return;

    try {
      // For now, just remove from local state
      // In a real app, you would call an API to delete the attachment
      setExistingAttachments(prev => prev.filter(a => a.id !== attachmentId));
    } catch (error) {
      console.error('Error deleting attachment:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    try {
      // Update mail data
      const mailData: Partial<Mail> = {
        ...formData,
        receivedDate: new Date(formData.receivedDate),
        sentDate: formData.sentDate ? new Date(formData.sentDate) : undefined,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      };

      const updatedMail = await mailService.updateMail(mail.id, mailData);
      
      if (!updatedMail) {
        throw new Error('Failed to update mail');
      }
      
      // Upload new attachments if any
      if (selectedFiles.length > 0) {
        setUploadingFiles(selectedFiles.map(f => f.name));
        
        try {
          const uploadPromises = selectedFiles.map(file => 
            mailService.uploadAttachment(file, mail.id)
          );
          
          const newAttachments = await Promise.all(uploadPromises);
          updatedMail.attachments = [...existingAttachments, ...newAttachments];
        } catch (error) {
          console.error('Error uploading attachments:', error);
        } finally {
          setUploadingFiles([]);
        }
      } else {
        updatedMail.attachments = existingAttachments;
      }

      onUpdate(updatedMail);
      onClose();
    } catch (error) {
      console.error('Error updating mail:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{t('common.editMail')}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('common.type')} *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
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
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('common.status')} *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">{t('mailStatus.pending')}</option>
                <option value="in_progress">{t('mailStatus.in_progress')}</option>
                <option value="completed">{t('mailStatus.completed')}</option>
                <option value="archived">{t('mailStatus.archived')}</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Subject *
            </label>
            <div className="relative">
              <MailIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter mail subject"
              />
            </div>
          </div>

          {/* Sender and Recipient */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('common.sender')} *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="sender"
                  value={formData.sender}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter sender name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('common.recipient')} *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="recipient"
                  value={formData.recipient}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter recipient name"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Received Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  name="receivedDate"
                  value={formData.receivedDate}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Sent Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  name="sentDate"
                  value={formData.sentDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Action Required */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Action Required
            </label>
            <input
              type="text"
              name="actionRequired"
              value={formData.actionRequired}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="What action needs to be taken?"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes..."
            />
          </div>

          {/* Existing Attachments */}
          {existingAttachments.length > 0 && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Current Attachments
              </label>
              <div className="space-y-2">
                {existingAttachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700 flex-1">{attachment.name}</span>
                    <div className="flex items-center gap-2">
                      <a
                        href={attachment.url}
                        download
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => removeExistingAttachment(attachment.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Add New Attachments
            </label>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">
                      Upload files
                    </span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="sr-only"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                  </label>
                  <p className="text-gray-500 text-sm mt-1">
                    PDF, images, documents up to 10MB
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Files */}
            {(selectedFiles.length > 0 || uploadingFiles.length > 0) && (
              <div className="space-y-2">
                {uploadingFiles.map((fileName) => (
                  <div key={fileName} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-blue-700">{fileName}</span>
                    <div className="ml-auto">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </div>
                ))}
                
                {selectedFiles.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-auto text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t('common.save')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMail;
