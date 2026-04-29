import { useEffect, useState } from 'react';
import './App.css';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyOtp from './pages/VerifyOtp';
import Dashboard from './pages/Dashboard';
import { profileApi, session } from './lib/api';

const App = () => {
  const [screen, setScreen] = useState('loading');
  const [pendingSignup, setPendingSignup] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authNotice, setAuthNotice] = useState('');

  const hydrateSession = async () => {
    try {
      const user = await profileApi.getMe();
      localStorage.setItem('user', JSON.stringify(user));
      setCurrentUser(user);
      setScreen('app');
    } catch (error) {
      console.error(error);
      session.clear();
      setCurrentUser(null);
      setScreen('login');
      setAuthNotice('Login karke apni chats access karo.');
    }
  };

  useEffect(() => {
    if (session.getToken()) {
      hydrateSession();
      return;
    }

    setScreen('login');
  }, []);

  const handleLoginSuccess = async (token) => {
    session.setToken(token);
    await hydrateSession();
  };

  const handleLogout = () => {
    session.clear();
    setCurrentUser(null);
    setPendingSignup(null);
    setScreen('login');
    setAuthNotice('Session logout ho gaya.');
  };

  const handleRegistrationSuccess = () => {
    setPendingSignup(null);
    setScreen('login');
    setAuthNotice('Account ready hai. Ab login karo.');
  };

  if (screen === 'loading') {
    return (
      <div className="loading-screen">
        <div className="loading-card">
          <p className="eyebrow">Chat Application</p>
          <h1>Preparing your workspace</h1>
          <p>Session check ho raha hai...</p>
        </div>
      </div>
    );
  }

  if (screen === 'login') {
    return (
      <Login
        onNavigateToSignup={() => {
          setAuthNotice('');
          setScreen('signup');
        }}
        onLoginSuccess={handleLoginSuccess}
        notice={authNotice}
      />
    );
  }

  if (screen === 'signup') {
    return (
      <Signup
        onNavigateToLogin={() => {
          setScreen('login');
          setAuthNotice('');
        }}
        onNavigateToOtp={(signupData) => {
          setPendingSignup(signupData);
          setScreen('otp');
        }}
      />
    );
  }

  if (screen === 'otp') {
    return (
      <VerifyOtp
        signupData={pendingSignup}
        onNavigateToLogin={() => setScreen('login')}
        onRegistrationSuccess={handleRegistrationSuccess}
      />
    );
  }

  if (screen === 'app' && currentUser) {
    return (
      <Dashboard
        user={currentUser}
        onUserUpdated={setCurrentUser}
        onLogout={handleLogout}
      />
    );
  }

  return null;
};

export default App;
