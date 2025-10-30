import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Header } from './components/Layout/Header';
import { Login } from './components/Auth/Login';
import { SignUp } from './components/Auth/SignUp';
import { PatientDashboard } from './components/Patient/PatientDashboard';
import { DoctorDashboard } from './components/Doctor/DoctorDashboard';

function App() {
  const { user, profile, loading } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return showSignUp ? (
      <SignUp onToggle={() => setShowSignUp(false)} />
    ) : (
      <Login onToggle={() => setShowSignUp(true)} />
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      {profile.role === 'patient' ? <PatientDashboard /> : <DoctorDashboard />}
    </div>
  );
}

export default App;
