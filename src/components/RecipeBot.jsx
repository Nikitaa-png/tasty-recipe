import { useState, useRef, useEffect } from 'react';
import './RecipeBot.css';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY || 'AIzaSyDbVREIhMW64-aw0A01KUArR9EvF0YzugI';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

const SYSTEM_PROMPT = `You are Tasty, a friendly AI recipe assistant for the Tasty Recipe app.
Your job is to:
- Suggest recipes based on ingredients the user has
- Help users find Indian and international dishes
- Recommend trending, easy, or quick recipes
- Give short cooking tips and substitutions
- Answer questions about cooking techniques

Rules:
- Keep responses concise and friendly (max 150 words)
- Always suggest real, specific dish names
- If asked about non-food topics, politely redirect to recipes
- Use emojis to make responses fun
- Format recipe suggestions as a short list when possible`;

const QUICK_PROMPTS = [
  '🍛 Easy Indian recipes',
  '🥗 Quick 15-min meals',
  '🧅 What can I make with onion, tomato, potato?',
  '🔥 Trending dishes right now',
  '🌱 Vegetarian dinner ideas',
];

export default function RecipeBot() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hi! I'm Tasty 🍴 your AI recipe assistant. Ask me anything — ingredients you have, dishes to try, or cooking tips!",
    },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);
  const inputRef              = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const sendMessage = async (text) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Build conversation history (exclude the initial greeting)
      const history = newMessages.slice(1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }],
      }));

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: history,
        }),
      });

      const data = await res.json();

      // Log error details if any
      if (data.error) {
        console.error('Gemini error:', data.error);
        throw new Error(data.error.message);
      }

      const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
        || "I couldn't generate a response. Please try again!";

      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      console.error('Bot error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `Oops! Something went wrong: ${err.message || 'Unknown error'}. Please try again.`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <>
      {/* Floating button */}
      <button
        className={`bot-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Open recipe assistant"
      >
        {open ? '✕' : '🍴'}
        {!open && <span className="bot-fab-label">Ask AI</span>}
      </button>

      {/* Chat window */}
      <div className={`bot-window ${open ? 'bot-open' : ''}`}>
        {/* Header */}
        <div className="bot-header">
          <div className="bot-header-left">
            <div className="bot-avatar">🍴</div>
            <div>
              <div className="bot-name">Tasty AI</div>
              <div className="bot-status">
                <span className="bot-dot" /> Recipe Assistant
              </div>
            </div>
          </div>
          <button className="bot-close" onClick={() => setOpen(false)}>✕</button>
        </div>

        {/* Messages */}
        <div className="bot-messages">
          {messages.map((m, i) => (
            <div key={i} className={`bot-msg ${m.role}`}>
              {m.role === 'assistant' && <div className="bot-msg-avatar">🍴</div>}
              <div className="bot-msg-bubble">
                {m.text.split('\n').map((line, j) => (
                  <span key={j}>{line}{j < m.text.split('\n').length - 1 && <br />}</span>
                ))}
              </div>
            </div>
          ))}

          {loading && (
            <div className="bot-msg assistant">
              <div className="bot-msg-avatar">🍴</div>
              <div className="bot-msg-bubble bot-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick prompts */}
        {messages.length <= 1 && (
          <div className="bot-quick-prompts">
            {QUICK_PROMPTS.map(p => (
              <button key={p} className="bot-quick-btn" onClick={() => sendMessage(p)}>
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="bot-input-row">
          <textarea
            ref={inputRef}
            className="bot-input"
            placeholder="Ask about recipes, ingredients…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            disabled={loading}
          />
          <button
            className="bot-send"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            aria-label="Send"
          >
            ➤
          </button>
        </div>
      </div>
    </>
  );
}
