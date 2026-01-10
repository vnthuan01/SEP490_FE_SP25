import { useState, useEffect, type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { LoginPayload, User } from '@/services/authService';
import { AuthContext } from './AuthContextType';

type AuthProviderProps = { children: ReactNode };

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const {
    user: profileUser,
    isLoading: authLoading,
    login: loginMutate,
    logout: logoutMutate,
  } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      setUser(profileUser); // có thể null nếu chưa login
      setLoading(false);
    }
  }, [profileUser, authLoading]);

  const login = (data: LoginPayload) => loginMutate(data);

  const logout = () => {
    logoutMutate();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user != null,
        isLoading: loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
