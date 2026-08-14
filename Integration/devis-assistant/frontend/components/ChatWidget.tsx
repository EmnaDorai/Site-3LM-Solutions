'use client';

import { useEffect, useRef, useState } from 'react';
import { postChatMessage } from '@/lib/chat';
import './ChatWidget.css';

const SESSION_STORAGE_KEY = 'chat_session_id';
const QUICK_REPLIES = ['Quels sont vos services ?', 'Je veux un rendez-vous', 'Parlez-moi de l\'IA'];

interface ChatMessage {
  sender: 'user' | 'bot';
  content: string;
}

function uuidv4(): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getOrCreateSessionId = () => {
    let storedSessionId = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!storedSessionId) {
      storedSessionId = uuidv4();
      window.localStorage.setItem(SESSION_STORAGE_KEY, storedSessionId);
    }
    return storedSessionId;
  };

  useEffect(() => {
    const storedSessionId = getOrCreateSessionId();
    setSessionId(storedSessionId);
    setMessages([
      {
        sender: 'bot',
        content:
          "Bonjour, je suis l'assistant de 3LM Solutions. Je peux répondre à vos questions, présenter nos services ou vous orienter vers un rendez-vous.",
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => setIsOpen((current) => !current);

  const sendMessage = async (text: string) => {
    const userInput = text.trim();
    if (!userInput || isLoading) return;

    setMessages((prev) => [...prev, { sender: 'user', content: userInput }]);
    setIsLoading(true);
    setDraft('');

    try {
      const currentSessionId = sessionId || getOrCreateSessionId();
      setSessionId(currentSessionId);
      const response = await postChatMessage(userInput, currentSessionId);
      setMessages((prev) => [...prev, { sender: 'bot', content: response.assistant_message.content }]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          content:
            "Désolé, le service de chat ne répond pas pour le moment. Vous pouvez contacter 3LM Solutions au +216 54 507 574 ou à contact@3lmsolutions.net.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(draft);
  };

  return (
    <>
      <button
        className="chat-toggle-button"
        onClick={toggleChat}
        aria-label={isOpen ? 'Fermer le chat' : 'Ouvrir le chat'}
      >
        <span aria-hidden="true">{isOpen ? '×' : 'AI'}</span>
      </button>

      {isOpen && (
        <div className="chat-widget">
          <div className="chat-header">
            <div className="chat-avatar" aria-hidden="true">3L</div>
            <div className="chat-heading">
              <span className="chat-status">En ligne</span>
              <h3>Assistant 3LM Solutions</h3>
            </div>
            <button className="chat-close-button" onClick={toggleChat} aria-label="Fermer le chat">×</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={`${msg.sender}-${index}`} className={`message ${msg.sender}`}>
                <span>{msg.content}</span>
              </div>
            ))}
            {isLoading && (
              <div className="message bot">
                <div className="typing-indicator" aria-label="Assistant en train d'écrire">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-quick-replies" aria-label="Suggestions">
            {QUICK_REPLIES.map((reply) => (
              <button key={reply} type="button" onClick={() => sendMessage(reply)} disabled={isLoading}>
                {reply}
              </button>
            ))}
          </div>

          <form className="chat-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              name="message"
              placeholder="Écrivez votre message..."
              autoComplete="off"
              disabled={isLoading}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" disabled={isLoading || !draft.trim()}>Envoyer</button>
          </form>
        </div>
      )}
    </>
  );
}
