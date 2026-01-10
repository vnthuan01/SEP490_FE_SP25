import { useQuery } from '@tanstack/react-query';
import { authService, type User } from '@/services/authService';
import type { UserRoleType } from '@/enums/UserRole';

export type AuthInfo = {
  isAuthenticated: boolean;
  role: UserRoleType | null;
  user: User | null;
};

/**
 * Hook checkAuth: luôn đồng bộ với server qua react-query
 */
export function useCheckAuth(): AuthInfo {
  const { data: user, isLoading } = useQuery({
    queryKey: ['users', 'profile'],
    queryFn: async () => {
      const res = await authService.me();
      return res.data.data;
    },
    retry: false, // không retry nếu chưa login
  });

  if (isLoading) {
    return {
      isAuthenticated: false,
      role: null,
      user: null,
    };
  }

  if (user) {
    return {
      isAuthenticated: true,
      role: user.role,
      user,
    };
  }

  return {
    isAuthenticated: false,
    role: null,
    user: null,
  };
}
