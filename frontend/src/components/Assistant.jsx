import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import { askAIAssistant } from '../api';

export default function Assistant() {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: 'Hello! I am your AI Personal Finance Assistant. You can ask me questions about budgeting, saving strategies, debt management, or general financial planning.'
    }
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    'How do I create a simple monthly budget?',
    'What is the 50/30/20 budgeting rule?',
    'How can I reduce my grocery and food expenses?',
    'What are the best tips to build an emergency fund?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (questionText) => {
    const q = (questionText || inputQuestion).trim();
    if (!q || loading) return;

    // Append User message
    setMessages(prev => [...prev, { sender: 'user', text: q }]);
    setInputQuestion('');
    setLoading(true);

    try {
      const res = await askAIAssistant(q);
      const answer = res?.answer || 'No response received from assistant.';
      setMessages(prev => [...prev, { sender: 'assistant', text: answer }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: `Error communicating with AI assistant: ${err.message}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-container">
      {/* Messages Scroll Area */}
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.sender}`}>
            <div className={`chat-avatar ${msg.sender === 'user' ? 'user-avatar' : 'ai-avatar'}`}>
              {msg.sender === 'user' ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div className="chat-bubble">
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-message assistant">
            <div className="chat-avatar ai-avatar">
              <Bot size={18} />
            </div>
            <div className="chat-bubble" style={{ fontStyle: 'italic', color: '#94a3b8' }}>
              AI Assistant is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      <div style={{ padding: '0.75rem 1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(11, 15, 25, 0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
          <Sparkles size={12} color="#60a5fa" />
          Suggested Questions:
        </div>
        <div className="chips-row" style={{ marginTop: '0.25rem' }}>
          {quickQuestions.map((q, idx) => (
            <button 
              key={idx} 
              type="button" 
              className="chip-btn" 
              onClick={() => handleSend(q)}
              disabled={loading}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="chat-input-bar">
        <input 
          type="text"
          className="input-control"
          placeholder="Ask a financial question (e.g., 'How can I save 20% of my income?')..."
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button 
          type="button" 
          className="btn btn-primary" 
          onClick={() => handleSend()}
          disabled={loading || !inputQuestion.trim()}
          style={{ padding: '0 1.25rem' }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
