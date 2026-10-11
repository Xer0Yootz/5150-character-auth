import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function GroupChatPage({ user, character }) {
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [aiOn, setAiOn] = useState(true);
  const [aiReply, setAiReply] = useState('');

  useEffect(() => {
    async function load() {
      await fetch('/api/bitchat/keypair', { credentials: 'include' });
      const response = await fetch('/api/bitchat/groups', { credentials: 'include' });
      const data = await response.json();
      setGroups(data.groups || []);
    }
    load();
  }, []);

  const loadMessages = async (id) => {
    setGroupId(id);
    const response = await fetch(`/api/bitchat/messages/${id}`, { credentials: 'include' });
    const data = await response.json();
    setMessages(data.messages || []);
  };

  const send = async (event) => {
    event.preventDefault();
    setError('');
    setAiReply('');

    if (aiOn) {
      try {
        const response = await fetch('/api/gemini/chat', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Gemini failed');
        setAiReply(data.reply);
      } catch (err) {
        setError(err.message);
      }
    }

    if (groupId) {
      const response = await fetch('/api/bitchat/send', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          ciphertext: text,
          nonce: 'plain'
        })
      });
      if (response.ok) {
        setText('');
        loadMessages(groupId);
      }
    } else {
      setText('');
    }
  };

  return (
    <main className="page-shell">
      <div className="panel">
        <div className="title-wrap">
          <span className="tag">5150</span>
          <h1>Chat</h1>
          <p className="hub-meta">{user.name} / {character.codename}</p>
        </div>
        <p><Link to="/hub">Back</Link></p>
        <label className="switch">
          <input type="checkbox" checked={aiOn} onChange={(e) => setAiOn(e.target.checked)} /> Hexa (Gemini)
        </label>
        {groups.map((group) => (
          <button key={group.id} type="button" onClick={() => loadMessages(group.id)}>{group.name}</button>
        ))}
        <div className="form">
          {messages.map((message) => (
            <p key={message.id}>{message.sender_name}: {message.ciphertext}</p>
          ))}
          {aiReply && <p className="hub-meta">Hexa: {aiReply}</p>}
        </div>
        <form className="form" onSubmit={send}>
          <label><span>Message</span><input value={text} onChange={(e) => setText(e.target.value)} /></label>
          {error && <p className="error">{error}</p>}
          <button className="btn primary" type="submit">Send</button>
        </form>
      </div>
    </main>
  );
}
