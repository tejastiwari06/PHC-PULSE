import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginSignup from './pages/LoginSignup';
import PhcDashboard from './pages/PhcDashboard';
import DistrictDashboard from './pages/DistrictDashboard';

function Gate() {
  const { user } = useAuth();

  if (!user) return <LoginSignup />;

  if (user.role === 'district_officer') return <DistrictDashboard />;
  return <PhcDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="*" element={<Gate />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
