import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ isAdmin = false }) => {
  const isAuthenticated = localStorage.getItem("token");
  const isAdminAuthenticated = localStorage.getItem("adminToken");

  if (isAdmin) {
    return isAdminAuthenticated ? <Outlet /> : <Navigate to="/admin/login" />;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default PrivateRoute;
