import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Server, Database, AlertCircle } from 'lucide-react';
import { isUsingRealAPI, apiService } from '../../services';

const ApiStatus: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const usingRealAPI = isUsingRealAPI();
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (usingRealAPI) {
      checkApiConnection();
    }
  }, [usingRealAPI]);

  const checkApiConnection = async () => {
    try {
      setApiStatus('checking');
      
      // Test simple de connexion à l'API
      const response = await fetch(`${apiUrl}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        // 401 est normal si pas connecté
        setApiStatus('connected');
        setErrorMessage('');
      } else if (response.ok) {
        setApiStatus('connected');
        setErrorMessage('');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('API connection test failed:', error);
      setApiStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Connection failed');
    }
  };

  if (!usingRealAPI) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg text-xs">
        <Database className="w-3 h-3 text-blue-600" />
        <span className="text-blue-700">Mode Demo</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
      apiStatus === 'connected' ? 'bg-green-50' :
      apiStatus === 'error' ? 'bg-red-50' : 'bg-yellow-50'
    }`}>
      {apiStatus === 'checking' && (
        <>
          <div className="w-3 h-3 border border-yellow-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-yellow-700">Connexion...</span>
        </>
      )}
      
      {apiStatus === 'connected' && (
        <>
          <Server className="w-3 h-3 text-green-600" />
          <span className="text-green-700">API Connectée</span>
        </>
      )}
      
      {apiStatus === 'error' && (
        <>
          <AlertCircle className="w-3 h-3 text-red-600" />
          <span className="text-red-700" title={errorMessage}>
            API Erreur
          </span>
          <button
            onClick={checkApiConnection}
            className="text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </>
      )}
      
      {apiUrl && (
        <span className="text-gray-500 truncate max-w-24" title={apiUrl}>
          {apiUrl.replace('http://localhost:8000/api', ':8000')}
        </span>
      )}
    </div>
  );
};

export default ApiStatus;