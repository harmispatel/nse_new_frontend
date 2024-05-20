import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoutes = () => {
  let auth;
  const token = localStorage.getItem("token");
  token ? (auth = { token: true }) : (auth = { token: false });

  return auth.token ? <Outlet /> : <Navigate to='/login' />;
};

export default PrivateRoutes;



