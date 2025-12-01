import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface AuthContextProps {
  isAuthenticated: boolean;
  playerName: string;
  modalView: 'LOGIN' | 'SIGN_UP' | null;
  login: () => void;
  logout: () => void;
  setPlayerName: (name: string) => void;
  setModalView: (view: 'LOGIN' | 'SIGN_UP' | null) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [modalView, setModalView] = useState<'LOGIN' | 'SIGN_UP' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch( 'https://ratemywarrioroflight-api.onrender.com/api/auth/check'/*'http://localhost:5001/api/auth/check' */, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setIsAuthenticated(data.isAuthenticated);
          setPlayerName(data.username);
        } else {
          setIsAuthenticated(false);
          setPlayerName('');
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setIsAuthenticated(false);
        setPlayerName('');
      }

      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = () => setIsAuthenticated(true);
  const logout = async () => {
      try {
        await fetch(/*"http://localhost:5001/api/auth/logout"*/ "https://ratemywarrioroflight-api.onrender.com/api/auth/logout", {
          method: "POST",
          credentials: "include"
        });

        setIsAuthenticated(false);
        setPlayerName('');
      } catch (err) {
        console.error("Logout failed", err);
      }
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, playerName, modalView, login, logout, setPlayerName, setModalView }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
