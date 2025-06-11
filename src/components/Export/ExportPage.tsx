import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, FileText, Table } from 'lucide-react';
import { Mail } from '../../types';
import { mailService } from '../../services/mailService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';

const ExportPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [mails, setMails] = useState<Mail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const locale = i18n.language === 'fr' ? fr : enUS;

  useEffect(() => {
    loadMails();
  }, []);

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

  const exportToPDF = async () => {
    setIsExporting(true);
    
    try {
      const pdf = new jsPDF();
      
      // Title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.text('Mail Management Report', 20, 20);
      
      // Date
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${format(new Date(), 'PPP', { locale })}`, 20, 30);
      
      // Summary
      const stats = {
        total: mails.length,
        pending: mails.filter(m => m.status === 'pending').length,
        completed: mails.filter(m => m.status === 'completed').length,
        overdue: mails.filter(m => m.dueDate && new Date(m.dueDate) < new Date() && m.status !== 'completed').length,
      };
      
      pdf.text(`Total Mails: ${stats.total}`, 20, 45);
      pdf.text(`Pending: ${stats.pending}`, 20, 55);
      pdf.text(`Completed: ${stats.completed}`, 20, 65);
      pdf.text(`Overdue: ${stats.overdue}`, 20, 75);

      // Table
      const tableData = mails.map(mail => [
        mail.subject,
        t(`mailType.${mail.type}`),
        mail.sender,
        mail.recipient,
        format(new Date(mail.receivedDate), 'PP', { locale }),
        t(`mailStatus.${mail.status}`),
        mail.dueDate ? format(new Date(mail.dueDate), 'PP', { locale }) : '-',
      ]);

      autoTable(pdf, {
        head: [['Subject', 'Type', 'Sender', 'Recipient', 'Received', 'Status', 'Due Date']],
        body: tableData,
        startY: 90,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] },
      });

      pdf.save(`mail-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = async () => {
    setIsExporting(true);
    
    try {
      const headers = [
        'Subject',
        'Type',
        'Sender',
        'Recipient',  
        'Received Date',
        'Status',
        'Due Date',
        'Action Required',
        'Notes'
      ];

      const csvData = mails.map(mail => [
        mail.subject,
        t(`mailType.${mail.type}`),
        mail.sender,
        mail.recipient,
        format(new Date(mail.receivedDate), 'yyyy-MM-dd'),
        t(`mailStatus.${mail.status}`),
        mail.dueDate ? format(new Date(mail.dueDate), 'yyyy-MM-dd') : '',
        mail.actionRequired || '',
        mail.notes || ''
      ]);

      const csvContent = [headers, ...csvData]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `mail-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    } finally {
      setIsExporting(false);
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
        <h1 className="text-3xl font-bold text-gray-900">{t('nav.export')}</h1>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Export to PDF</h3>
              <p className="text-gray-600 text-sm">Generate a formatted PDF report</p>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Mails:</span>
              <span className="font-medium">{mails.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pending:</span>
              <span className="font-medium text-yellow-600">
                {mails.filter(m => m.status === 'pending').length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Completed:</span>
              <span className="font-medium text-green-600">
                {mails.filter(m => m.status === 'completed').length}
              </span>
            </div>
          </div>

          <button
            onClick={exportToPDF}
            disabled={isExporting || mails.length === 0}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download PDF
              </>
            )}
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Table className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Export to CSV</h3>
              <p className="text-gray-600 text-sm">Export data for spreadsheet analysis</p>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Format:</span>
              <span className="font-medium">Comma Separated Values</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Includes:</span>
              <span className="font-medium">All fields & metadata</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Compatible with:</span>
              <span className="font-medium">Excel, Google Sheets</span>
            </div>
          </div>

          <button
            onClick={exportToCSV}
            disabled={isExporting || mails.length === 0}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Download CSV
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Export Preview</h2>
          <p className="text-sm text-gray-600">Preview of data to be exported</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mails.slice(0, 10).map((mail) => (
                <tr key={mail.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {mail.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {t(`mailType.${mail.type}`)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {mail.sender}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      mail.status === 'completed' ? 'bg-green-100 text-green-800' :
                      mail.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      mail.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {t(`mailStatus.${mail.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(mail.receivedDate), 'PP', { locale })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {mails.length > 10 && (
            <div className="px-6 py-3 bg-gray-50 text-center text-sm text-gray-500">
              ... and {mails.length - 10} more items
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportPage;