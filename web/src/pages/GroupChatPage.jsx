import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../App.jsx';

export default function GroupChatPage({ user }) {
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      await fetch(`${API_URL}/api/bitchat/keypair`, { credentials: 'include' });
      const response = await fetch(`${API_URL}/api/bitchat/groups`, { credentials: 'include' });
      const data = await response.json();
      setGroups(data.groups || []);
    }
    load();
  }, []);

  const loadMessages = async (id) => {
    setGroupId(id);
    const response = await fetch(`${API_URL}/api/bitchat/messages/${id}`, { credentials: 'include' });
    const data = await response.json();
    setMessages(data.messages || []);
  };

  const send = async (event) => {
    event.preventDefault();
    setError('');
    if (!groupId) {
      setError('Pick a group first.');
      return;
    }
    const response = await fetch(`${API_URL}/api/bitchat/send`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId,
        ciphertext: text,
        nonce: 'plain'
      })
    });
    if (!response.ok) {
      setError('Send failed.');
      return;
    }
    setText('');
    loadMessages(groupId);
  };

  return (
    <main>
      <h1>Chat</h1>
      <p>{user.name}</p>
      <p><Link to="/dashboard">Back</Link></p>
      {groups.map((group) => (
        <button key={group.id} type="button" onClick={() => loadMessages(group.id)}>{group.name}</button>
      ))}
      {messages.map((message) => (
        <p key={message.id}>{message.sender_name}: {message.ciphertext}</p>
      ))}
      <form onSubmit={send}>
        <label>Message<input value={text} onChange={(e) => setText(e.target.value)} /></label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Send</button>
      </form>
      <p>Send is plain text in this page. Encryption belongs on the client.</p>
    </main>
  );
}
