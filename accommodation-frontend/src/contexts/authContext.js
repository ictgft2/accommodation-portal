import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize authentication state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        // Check if user is already authenticated
        if (authService.isAuthenticated()) {
          const storedUser = authService.getStoredUser();
          
          if (storedUser) {
            // Set user immediately from storage
            setUser(storedUser);
            
            // Optionally verify token in background (don't logout on failure)
            try {
              const verifyResult = await authService.verifyToken();
              if (verifyResult.success && verifyResult.data) {
                // Update user data if verification returns updated info
                setUser(verifyResult.data);
                localStorage.setItem('user', JSON.stringify(verifyResult.data));
              }
            } catch (error) {
              // If verification fails, keep the stored user (don't logout)
              console.warn('Token verification failed, but keeping user logged in:', error);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Only clear auth data if there's a serious error
        if (error.message?.includes('corrupted') || error.status === 401) {
          await authService.logout();
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        setUser(result.data.user);
        setError(null);
        return { success: true, user: result.data.user };
      } else {
        setError(result.error);
        return { success: false, error: result.error, errors: result.errors };
      }
    } catch (error) {
      const errorMessage = 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        setError(null);
        return { success: true, data: result.data };
      } else {
        setError(result.error);
        return { success: false, error: result.error, errors: result.errors };
      }
    } catch (error) {
      const errorMessage = 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setLoading(true);
    
    try {
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if API call fails
      setUser(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const result = await authService.refreshToken();
      
      if (result.success) {
        // Get updated user data
        const userResult = await authService.getCurrentUser();
        if (userResult.success) {
          setUser(userResult.data);
        }
        return { success: true };
      } else {
        // Refresh failed, log out user
        await logout();
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      return { success: false, error: 'Session expired. Please log in again.' };
    }
  }, [logout]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update user data
  const updateUser = useCallback((userData) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...userData };
      // Update localStorage as well
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout,
    register,
    refreshToken,
    clearError,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
