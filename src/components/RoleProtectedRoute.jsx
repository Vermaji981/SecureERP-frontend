import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';
import { ShieldAlert } from 'lucide-react';

const RoleProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return <Loader fullScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRole(allowedRoles)) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '70vh',
          textAlign: 'center',
          padding: '24px'
        }}
      >
        <ShieldAlert size={64} color="#ef4444" style={{ marginBottom: '16px' }} />
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a' }}>403 - Access Forbidden</h2>
        <p style={{ color: '#64748b', marginTop: '8px', maxWidth: '400px' }}>
          Your account role (<strong style={{ color: '#4f46e5' }}>{user.role}</strong>) does not have sufficient permissions to access this module.
        </p>
      </div>
    );
  }

  return <Outlet />;
};

export default RoleProtectedRoute;
