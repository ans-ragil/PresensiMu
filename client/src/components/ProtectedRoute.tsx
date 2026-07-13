import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

const ADMIN_ROLES: UserRole[] = ['ADMIN', 'HR', 'SUPER_ADMIN'];

export const isAdminRole = (role: UserRole): boolean => ADMIN_ROLES.includes(role);

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={isAdminRole(user.role) ? '/admin/dashboard' : '/employee/dashboard'} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
