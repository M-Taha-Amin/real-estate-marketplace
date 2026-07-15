import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

export default function AuthRoute() {
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" replace />;
  }
  return <Outlet />;
}
