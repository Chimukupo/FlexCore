import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { SignupScreen } from './components/SignupScreen';
import { ProfileScreen } from './components/ProfileScreen';
import SearchScreen from './components/SearchScreen';

type AuthView = 'login' | 'signup';

const AuthenticatedApp = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SearchScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

const UnauthenticatedApp = () => {
  const [currentView, setCurrentView] = useState<AuthView>('login');

  const switchToSignup = () => setCurrentView('signup');
  const switchToLogin = () => setCurrentView('login');

  if (currentView === 'signup') {
    return <SignupScreen onSwitchToLogin={switchToLogin} />;
  }

  return <LoginScreen onSwitchToSignup={switchToSignup} />;
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return user ? <AuthenticatedApp /> : <UnauthenticatedApp />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
