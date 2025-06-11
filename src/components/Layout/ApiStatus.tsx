import React from 'react';
import { Wifi, WifiOff, Server, Database } from 'lucide-react';
import { isUsingRealAPI } from '../../services';

const ApiStatus: React.FC = () => {
  const usingRealAPI = isUsingRealAPI();
  const apiUrl = import.meta.env.VITE_API_URL;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs">
      {usingRealAPI ? (
        <>
          <Server className="w-3 h-3 text-green-600" />
          <span className="text-green-700">API Symfony</span>
          {apiUrl && (
            <span className="text-gray-500 truncate max-w-32" title={apiUrl}>
              {apiUrl}
            </span>
          )}
        </>
      ) : (
        <>
          <Database className="w-3 h-3 text-blue-600" />
          <span className="text-blue-700">Mode Demo</span>
        </>
      )}
    </div>
  );
};

export default ApiStatus;