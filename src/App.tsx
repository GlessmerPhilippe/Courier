import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import MailList from './components/Mail/MailList';
import AddMailForm from './components/Mail/AddMailForm';
import ExportPage from './components/Export/ExportPage';
import './i18n';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AuthPage: React.FC = () => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  return (
    <LoginForm 
      onToggleMode={() => setIsRegisterMode(!isRegisterMode)}
      isRegisterMode={isRegisterMode}
    />
  );
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/mails" element={<MailList />} />
        <Route path="/add-mail" element={<AddMailForm />} />
        <Route path="/notifications" element={<div className="p-8 text-center text-gray-500">Notifications feature coming soon...</div>} />
        <Route path="/export" element={<ExportPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;