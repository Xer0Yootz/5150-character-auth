import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingScreen from './pages/LoadingScreen.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import CharacterCreation from './pages/CharacterCreation.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import GroupChatPage from './pages/GroupChatPage.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
          return fetch('/api/character/me', { credentials: 'include' })
            .then((r) => (r.ok ? r.json() : null))
            .then((c) => setCharacter(c?.character || null));
        }
        setUser(null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={user ? (character ? <Navigate to="/dashboard" replace /> : <Navigate to="/character/create" replace />) : <LoginPage setUser={setUser} />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <SignupPage setUser={setUser} />} />
      <Route path="/character/create" element={user && !character ? <CharacterCreation setCharacter={setCharacter} /> : <Navigate to="/" replace />} />
      <Route path="/dashboard" element={user && character ? <DashboardPage user={user} character={character} setUser={setUser} /> : <Navigate to="/" replace />} />
      <Route path="/chat" element={user && character ? <GroupChatPage user={user} character={character} /> : <Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
