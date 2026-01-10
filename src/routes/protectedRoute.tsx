import { Navigate } from 'react-router-dom';
import { useContext, type ReactNode } from 'react';
import { AuthContext } from '@/components/provider/auth/AuthContextType';
import { type UserRoleType } from '@/enums/UserRole';
import { getHomeByRole } from '@/lib/utils';
type RoleBasedRouteProps = {
  element: ReactNode;
  roles?: UserRoleType[];
};

export default function RoleBasedRoute({ element, roles = [] }: RoleBasedRouteProps) {
  const { user, isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={getHomeByRole(user.role)} replace />;
  }

  return element;
}
