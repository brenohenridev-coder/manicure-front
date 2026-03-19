import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const LicenseContext = createContext(null);

export function LicenseProvider({ children }) {
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);

  const check = async () => {
    try {
      const res = await api.get('/api/license/status');
      setLicense(res.data);
    } catch {
      setLicense({ active: false, reason: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    check();
    // Re-checa a cada 10 minutos
    const interval = setInterval(check, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <LicenseContext.Provider value={{ license, loading, refresh: check }}>
      {children}
    </LicenseContext.Provider>
  );
}

export const useLicense = () => useContext(LicenseContext);
