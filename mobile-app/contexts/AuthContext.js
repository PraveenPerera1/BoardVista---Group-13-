import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create Auth Context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user data from storage on app start
    const loadUserData = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const userRole = await AsyncStorage.getItem('userRole');
        const isAdminUser = userRole === 'admin';
        
        if (token) {
          setUser({ token, role: userRole });
          setIsAdmin(isAdminUser);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading user data:', error);
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAdmin(userData.role === 'admin');
    setLoading(false);
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    setLoading(false);
    AsyncStorage.multiRemove(['authToken', 'userRole', 'isAdmin']);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
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
