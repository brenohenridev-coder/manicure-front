import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ClientAuthContext = createContext(null);

export function ClientAuthProvider({ children }) {
  const [client, setClient] = useState(null);
  const [loadingClient, setLoadingClient] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('clientToken');
    const saved = localStorage.getItem('clientData');
    if (token && saved) {
      setClient(JSON.parse(saved));
      api.defaults.headers['x-client-token'] = token;
    }
    setLoadingClient(false);
  }, []);

  const loginClient = async (username, password) => {
    const res = await api.post('/api/client-auth/login', { username, password });
    localStorage.setItem('clientToken', res.data.token);
    localStorage.setItem('clientData', JSON.stringify(res.data.client));
    setClient(res.data.client);
    return res.data;
  };

  const registerClient = async (data) => {
    const res = await api.post('/api/client-auth/register', data);
    localStorage.setItem('clientToken', res.data.token);
    localStorage.setItem('clientData', JSON.stringify(res.data.client));
    setClient(res.data.client);
    return res.data;
  };

  const logoutClient = () => {
    localStorage.removeItem('clientToken');
    localStorage.removeItem('clientData');
    setClient(null);
  };

  const getClientToken = () => localStorage.getItem('clientToken');

  return (
    <ClientAuthContext.Provider value={{ client, loadingClient, loginClient, registerClient, logoutClient, getClientToken }}>
      {children}
    </ClientAuthContext.Provider>
  );
}

export const useClientAuth = () => useContext(ClientAuthContext);
