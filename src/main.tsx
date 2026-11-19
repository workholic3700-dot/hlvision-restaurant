
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { useEffect, useState } from "react";

import App from './App';
import ReservationPage from './ReservationPage';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import ReviewPage from './ReviewPage';
import './style.css';

function AdminAccess() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", {
      credentials: "include"
    })
      .then((response) => {
        setIsLoggedIn(response.ok);
      })
      .catch(() => {
        setIsLoggedIn(false);
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch(
        "/api/auth/logout",
        {
          method: "POST",
          credentials: "include"
        }
      );

      if (response.ok) {
        setIsLoggedIn(false);
      } else {
        console.error("Logout failed.");
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (checking) {
    return <p>Checking authentication...</p>;
  }

  return isLoggedIn ? (
    <AdminDashboard onLogout={handleLogout} />
  ) : (
    <AdminLogin onLogin={() => setIsLoggedIn(true)} />
  );
}

ReactDOM.createRoot(
  document.getElementById('app')!
).render(
  <React.StrictMode>
    <BrowserRouter>
  <Routes>
  <Route path="/" element={<App />} />
  <Route path="/reservation" element={<ReservationPage />} />
  <Route path="/write-review" element={<ReviewPage />} />
  <Route path="/admin" element={<AdminAccess />} />
</Routes>
    </BrowserRouter>
  </React.StrictMode>
);
