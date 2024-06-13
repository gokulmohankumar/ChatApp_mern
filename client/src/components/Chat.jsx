import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Chat.css';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [fromUser, setFromUser] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editMessageId, setEditMessageId] = useState(null);
  const [activeMessageId, setActiveMessageId] = useState(null);

  const baseURL = `http://localhost:3000/api`;

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${baseURL}/get`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    try {
      await axios.post(`${baseURL}/save`, {
        from: fromUser,
        message: newMessage,
      });
      setNewMessage('');
      setFromUser('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const updateMessage = async () => {
    try {
      if (editMode && editMessageId) {
        await axios.put(`${baseURL}/update/${editMessageId}`, {
          from: fromUser,
          message: newMessage
        });
        setEditMode(false);
        setEditMessageId(null);
        setNewMessage('');
        setFromUser('');
        fetchMessages();
      }
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const handleSendButtonClick = () => {
    if (editMode) {
      updateMessage();
    } else {
      sendMessage();
    }
  };

  const handleEditButtonClick = (messageId, from, message) => {
    setEditMode(true);
    setEditMessageId(messageId);
    setFromUser(from);
    setNewMessage(message);
    setActiveMessageId(null);
  };

  const handleDeleteButtonClick = async (messageId) => {
    try {
      await axios.delete(`${baseURL}/delete/${messageId}`);
      fetchMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleCopyButtonClick = (message) => {
    navigator.clipboard.writeText(message);
    setActiveMessageId(null);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditMessageId(null);
    setNewMessage('');
    setFromUser('');
  };

  return (
    <div className="chat-container">
      <div className="input-group">
        <label>CHAT APPLICATION</label><br />
        <input
          type="text"
          value={fromUser}
          onChange={(e) => setFromUser(e.target.value)}
          placeholder="From"
          required={!editMode}
        /><br />
        <textarea
          rows={6}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          required={!editMode}
        /><br />
        {editMode ? (
          <div>
            <button className="savebutton" onClick={updateMessage}>Update</button>
            <button className="savebutton" onClick={cancelEdit}>Cancel</button>
          </div>
        ) : (
          <button className="sendbutton" onClick={handleSendButtonClick}>Send</button>
        )}
      </div>
      <div className="message-list">
        {messages.map((message) => (
          <div key={message._id} className="message-card">
            <div className="message-info">
              <div>
                {message.from}<br />
              </div>
            </div>
            <div className="message-content">
              <br />
              {message.message}
              <div className="message-actions">
                <button className="three-dots" onClick={() => setActiveMessageId(message._id === activeMessageId ? null : message._id)}>⋮</button>
                {activeMessageId === message._id && (
                  <div className="dropdown-menu">
                    <button className="dropdown-item" onClick={() => handleEditButtonClick(message._id, message.from, message.message)}>Edit</button>
                    <button className="dropdown-item" onClick={() => handleCopyButtonClick(message.message)}>Copy</button>
                    <button className="dropdown-item" onClick={() => handleDeleteButtonClick(message._id)}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
