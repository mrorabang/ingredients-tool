import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';
import toastService from '../services/toastService';

const ProtectedRoute = ({ children }) => {
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toastService.warning('Vui lòng đăng nhập để truy cập trang này!');
    }
  }, []);

  return authService.isAuthenticated() ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
