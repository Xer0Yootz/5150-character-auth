import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoadingScreen from './pages/LoadingScreen.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import CharacterCreation from './pages/CharacterCreation.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import GroupChatPage from './pages/GroupChatPage.jsx';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' });
        if (!response.ok) {
          setUser(null);
          return;
        }
        const data = await response.json();
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage onUserChange={setUser} />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignupPage onUserChange={setUser} />} />
      <Route path="/character" element={user ? <CharacterCreation /> : <Navigate to="/" replace />} />
      <Route path="/dashboard" element={user ? <DashboardPage user={user} onUserChange={setUser} /> : <Navigate to="/" replace />} />
      <Route path="/chat" element={user ? <GroupChatPage user={user} /> : <Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
