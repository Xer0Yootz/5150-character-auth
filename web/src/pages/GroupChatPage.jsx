import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../icons.jsx';

export default function GroupChatPage({ user, character }) {
  const [groups, setGroups] = useState([]);
  const [groupId, setGroupId] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [btStatus, setBtStatus] = useState('Bluetooth not requested');
  const [btDevice, setBtDevice] = useState('');
  const endRef = useRef(null);

  async function ensureRoom() {
    const keyRes = await fetch('/api/bitchat/keypair', { credentials: 'include' });
    if (!keyRes.ok) return;
    const groupsRes = await fetch('/api/bitchat/groups', { credentials: 'include' });
    const groupsData = await groupsRes.json();
    let list = groupsData.groups || [];
    if (!list.length) {
      const createRes = await fetch('/api/bitchat/groups', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Neon Vigil' })
      });
      if (createRes.ok) {
        const created = await createRes.json();
        list = [{ id: created.id, name: 'Neon Vigil' }];
      }
    }
    setGroups(list);
    if (list[0]) {
      setGroupId(list[0].id);
      loadMessages(list[0].id);
    }
  }

  useEffect(() => {
    ensureRoom();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async (id) => {
    const response = await fetch(`/api/bitchat/messages/${id}`, { credentials: 'include' });
    const data = await response.json();
    setMessages(data.messages || []);
  };

  const allowBluetooth = async () => {
    if (!navigator.bluetooth) {
      setBtStatus('Bluetooth not available in this browser');
      return;
    }
    try {
      setBtStatus('Requesting Bluetooth');
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['generic_access']
      });
      setBtDevice(device.name || 'Unnamed device');
      setBtStatus('Bluetooth allowed');
      device.addEventListener('gattserverdisconnected', () => {
        setBtStatus('Device disconnected');
        setBtDevice('');
      });
    } catch (err) {
      if (err.name === 'NotFoundError') {
        setBtStatus('No device selected');
      } else if (err.name === 'SecurityError' || err.name === 'NotAllowedError') {
        setBtStatus('Bluetooth blocked');
      } else {
        setBtStatus('Bluetooth failed');
      }
    }
  };

  const send = async (event) => {
    event.preventDefault();
    setError('');
    if (!text.trim() || !groupId) return;
    const response = await fetch('/api/bitchat/send', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        groupId,
        ciphertext: text.trim(),
        nonce: 'plain'
      })
    });
    if (response.ok) {
      setText('');
      loadMessages(groupId);
    } else {
      const data = await response.json().catch(() => ({}));
      setError(data.message || 'Send failed');
    }
  };

  return (
    <main className="page-shell">
      <div className="panel">
        <div className="title-wrap">
          <span className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Icon name="hex" /></span>
          <h1>Chat</h1>
          <p className="hub-meta">{user.name} / {character.codename}</p>
        </div>
        <p><Link to="/hub" className="btn ghost" aria-label="Back" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, marginBottom: 12, padding: 0 }}><Icon name="back" /></Link></p>

        <div style={{ marginBottom: 10 }}>
          <button type="button" className="btn ghost" onClick={allowBluetooth}>Allow Bluetooth</button>
          <p className="hub-meta" style={{ fontSize: 11, marginTop: 4 }}>
            {btStatus}{btDevice ? ` \u00b7 ${btDevice}` : ''}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              className={groupId === group.id ? 'btn primary' : 'btn ghost'}
              onClick={() => { setGroupId(group.id); loadMessages(group.id); }}
            >
              {group.name}
            </button>
          ))}
        </div>

        <div style={{
          height: 280,
          overflowY: 'auto',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          padding: 10,
          marginBottom: 10,
          background: 'rgba(0,0,0,0.35)'
        }}>
          {messages.length === 0 && <p className="hub-meta" style={{ fontSize: 12 }}>No messages yet.</p>}
          {messages.map((message) => {
            const mine = message.sender_id === user.id;
            return (
              <div key={message.id} style={{
                display: 'flex',
                justifyContent: mine ? 'flex-end' : 'flex-start',
                marginBottom: 8
              }}>
                <div style={{
                  maxWidth: '75%',
                  padding: '8px 10px',
                  background: mine ? 'rgba(195, 0, 255, 0.25)' : 'rgba(0, 240, 255, 0.12)',
                  border: mine ? '1px solid rgba(195, 0, 255, 0.5)' : '1px solid rgba(0, 240, 255, 0.4)'
                }}>
                  <div style={{ fontSize: 10, color: '#8aa0b8', marginBottom: 2 }}>
                    {mine ? 'You' : message.sender_name}
                  </div>
                  <div style={{ fontSize: 14 }}>{message.ciphertext}</div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <form className="form" onSubmit={send}>
          <label>
            <span>Message</span>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message" />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn primary" type="submit">Send</button>
        </form>
      </div>
    </main>
  );
}
