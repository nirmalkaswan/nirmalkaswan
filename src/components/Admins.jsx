import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_BASE_URL, {
  transports: ['websocket'], // Use websocket transport
});
const adminId = 'admin';

const AdminChat = () => {
  const [activeUsers, setActiveUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    socket.emit('join', { userId: adminId, role: 'admin' });
    socket.on('active_users', (users) => setActiveUsers(users));
    socket.on('conversation_list', (list) => setConversations(list));
    socket.emit('get_conversations', { adminId });

    return () => {
      socket.off('active_users');
      socket.off('conversation_list');
    };
  }, []);

  useEffect(() => {
    if (!selectedUser) return;

    socket.emit('get_messages', {
      senderId: adminId,
      receiverId: selectedUser._id,
    });

    const handleHistory = (history) => setMessages(history);
    socket.on('message_history', handleHistory);

    return () => {
      socket.off('message_history', handleHistory);
    };
  }, [selectedUser]);

  useEffect(() => {
    socket.on('receive_message', (msg) => {
      setMessages((prev) => {
        const alreadyExists = prev.some(
          (m) => m._id === msg._id || (m.senderId === msg.senderId && m.content === msg.content && m.createdAt === msg.createdAt)
        );
        return alreadyExists ? prev : [...prev, msg];
      });
    });

    return () => {
      socket.off('receive_message');
    };
  }, [selectedUser]);

  const sendMessage = () => {
    if (!text.trim() || !selectedUser) return;

    const message = {
      senderId: adminId,
      receiverId: selectedUser._id,
      content: text.trim(),
    };
    socket.emit('send_message', message);
    setText('');
  };

  const mergedUsers = [...new Map([...conversations, ...activeUsers].map((u) => [u._id, u])).values()];

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ width: '28%', backgroundColor: '#06142E', color: '#fff', padding: 20, overflowY: 'auto' }}>
        {mergedUsers.map((user) => (
          <div
            key={user._id}
            onClick={() => setSelectedUser(user)}
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 15,
              backgroundColor: selectedUser?._id === user._id ? '#1B3358' : 'transparent',
              padding: '10px 12px',
              borderRadius: 10,
              cursor: 'pointer',
            }}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${user.username}`}
              alt={user.username}
              style={{ width: 45, height: 45, borderRadius: '50%', marginRight: 12 }}
            />
            <div>
              <div style={{ fontWeight: 'bold' }}>{user.username}</div>
              <div style={{ fontSize: 12, color: '#bbb' }}>{user.lastMessage || 'No messages'}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, backgroundColor: '#F5F9FF', display: 'flex', flexDirection: 'column' }}>
        {selectedUser ? (
          <>
            <div style={{ backgroundColor: '#fff', padding: 16, display: 'flex', alignItems: 'center', borderBottom: '1px solid #ccc' }}>
              <img
                src={`https://ui-avatars.com/api/?name=${selectedUser.username}`}
                alt={selectedUser.username}
                style={{ width: 40, height: 40, borderRadius: '50%', marginRight: 10 }}
              />
              <h4>{selectedUser.username}</h4>
            </div>

            <div style={{ flex: 1, padding: 20, overflowY: 'auto' }}>
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: msg.senderId === adminId ? 'flex-end' : 'flex-start',
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '12px 16px',
                      backgroundColor: msg.senderId === adminId ? '#011C42' : '#fff',
                      color: msg.senderId === adminId ? '#fff' : '#000',
                      borderRadius: 20,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      position: 'relative',
                    }}
                  >
                    {msg.content}
                    <div style={{ fontSize: 10, marginTop: 4, textAlign: 'right', color: msg.senderId === adminId ? '#ccc' : '#666' }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: 12, backgroundColor: '#fff', display: 'flex', alignItems: 'center', borderTop: '1px solid #ccc' }}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Write Message"
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 30,
                  border: '1px solid #ccc',
                  outline: 'none',
                  marginRight: 10,
                }}
              />
              <button
                onClick={sendMessage}
                style={{
                  backgroundColor: '#011C42',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: 30,
                  cursor: 'pointer',
                }}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div style={{ margin: 'auto', textAlign: 'center', color: '#555' }}>
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChat;
