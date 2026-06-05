import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: ('user' | 'mod' | 'admin')[];
}

const RoleGate: React.FC<RoleGateProps> = ({ children, allowedRoles }) => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div>Loading access credentials...</div>;

  const currentRole = (user?.publicMetadata?.role as 'user' | 'mod' | 'admin') || 'user';

  if (!user || !allowedRoles.includes(currentRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RoleGate;