import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingScreen from './pages/LoadingScreen.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import CharacterCreation from './pages/CharacterCreation.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import GroupChatPage from './pages/GroupChatPage.jsx';

const MIN_INTRO_MS = 1800;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function App() {
  const [user, setUser] = useState(null);
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(8);
  const [label, setLabel] = useState('Entering virtual reality construct');

  useEffect(() => {
    let cancelled = false;
    const started = Date.now();

    async function load() {
      try {
        setProgress(20);
        setLabel('Entering virtual reality construct');
        const authResponse = await fetch('/api/auth/me', { credentials: 'include' });
        if (cancelled) return;
        setProgress(55);

        if (!authResponse.ok) {
          setUser(null);
          setProgress(100);
          setLabel('No IWW session');
        } else {
          const data = await authResponse.json();
          setUser(data.user);
          setProgress(70);
          setLabel('Logging in to the IWW');

          const characterResponse = await fetch('/api/character/me', { credentials: 'include' });
          if (cancelled) return;
          setProgress(90);

          if (characterResponse.ok) {
            const characterData = await characterResponse.json();
            setCharacter(characterData.character || null);
            setLabel(characterData.character ? 'Node read' : 'No character on this node');
          } else {
            setCharacter(null);
            setLabel('No character on this node');
          }
          setProgress(100);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setProgress(100);
          setLabel('IWW read failed');
        }
      } finally {
        const elapsed = Date.now() - started;
        const remaining = Math.max(0, MIN_INTRO_MS - elapsed);
        await wait(remaining);
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <LoadingScreen
        progress={progress}
        label={label}
        onSkip={() => setLoading(false)}
      />
    );
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
