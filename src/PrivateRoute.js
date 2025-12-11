import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = ({ role }) => {
  const token = localStorage.getItem('token'); // Verifica si hay un token en localStorage
  const userRole = localStorage.getItem('role'); // Verifica el rol del usuario

  if (!token) {
    // Si no hay token, redirige al login
    return <Navigate to="/login" />;
  }

  if (role && userRole !== role) {
    // Si el rol no coincide con el rol requerido, redirige a home o alguna otra página
    return <Navigate to="/home" />;
  }

  return <Outlet />; // Si pasa la verificación, muestra el componente hijo
};

export default PrivateRoute;
