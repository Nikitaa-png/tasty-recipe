import { useState, useRef, useEffect } from 'react';
import './RecipeBot.css';

// Groq for text chat
const GROQ_KEY  = import.meta.env.VITE_GROQ_KEY || '';
const GROQ_URL  = 'https://api.groq.com/openai/v1/chat/completions';

// Gemini for image vision + text fallback
const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY || 'AIzaSyApS2z-ySIfHD18qkJnExJxPiCawEppi6s';
const GEMINI_CHAT_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
const GEMINI_URL      = GEMINI_CHAT_URL;

const SYSTEM_PROMPT = `You are Tasty 🍴, a friendly AI recipe assistant for the Tasty Recipe app.
Your job:
- Suggest recipes based on ingredients the user has
- Help find Indian and international dishes
- Recommend trending, easy, or quick recipes
- Give short cooking tips and substitutions
- Answer cooking technique questions
Rules:
- Keep responses concise and friendly (max 150 words)
- Always suggest real, specific dish names
- If asked about non-food topics, politely redirect to recipes
- Use emojis to make responses fun
- Format recipe suggestions as a short numbered list when possible`;

const QUICK_PROMPTS = [
  '🍛 Easy Indian recipes',
  '🥗 Quick 15-min meals',
  '🧅 I have onion, tomato, potato',
  '🔥 Trending dishes',
  '🌱 Vegetarian dinner ideas',
  '📸 Upload a food photo',
];

// Convert file to base64
const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload  = () => resolve(reader.result.split(',')[1]);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

export default function RecipeBot() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([{
    role: 'assistant',
    text: "Hi! I'm Tasty 🍴 your AI recipe assistant.\n\nAsk me anything, or 📸 upload a food photo and I'll identify the dish and suggest a recipe!",
  }]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [preview, setPreview]   = useState(null); // image preview URL
  const [imageFile, setImageFile] = useState(null);

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);
  const fileRef    = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  // ── Handle image selection ──
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  const clearImage = () => {
    setImageFile(null);
    setPreview(null);
  };

  // ── Send image to Gemini Vision ──
  const analyzeImage = async (file) => {
    const base64 = await toBase64(file);
    const mimeType = file.type;

    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inline_data: { mime_type: mimeType, data: base64 },
            },
            {
              text: `You are a food recognition AI. Look at this image and:
1. Identify the dish or food item shown
2. Give a brief description (1-2 sentences)
3. Suggest how to make it (3-4 key steps)
4. List 5 main ingredients
Keep it friendly and use emojis. If it's not food, say so politely.`,
            },
          ],
        }],
      }),
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data?.candidates?.[0]?.content?.parts?.[0]?.text
      || "I couldn't identify this dish. Try a clearer photo!";
  };

  // ── Send text to Groq ──
  const sendToGroq = async (newMessages) => {
    // If no Groq key, fall back to Gemini for text
    if (!GROQ_KEY) {
      return sendToGeminiText(newMessages);
    }

    const chatMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...newMessages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text,
      })),
    ];

    const res = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: chatMessages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      // Fall back to Gemini on auth error
      if (res.status === 401) return sendToGeminiText(newMessages);
      throw new Error(`${res.status} ${data.error?.message || 'Unknown error'}`);
    }
    return data?.choices?.[0]?.message?.content || "I couldn't generate a response.";
  };

  // Gemini text fallback
  const sendToGeminiText = async (newMessages) => {
    const history = [
      { role: 'user',  parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: "Got it! I'm Tasty, your recipe assistant." }] },
      ...newMessages.slice(1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.text }],
      })),
    ];
    const res  = await fetch(GEMINI_CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: history }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error.message);
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
  };

  // ── Main send handler ──
  const sendMessage = async (text) => {
    if (loading) return;

    // Image-only send
    if (imageFile && !text && !input.trim()) {
      await handleImageSend();
      return;
    }

    const userText = text || input.trim();
    if (!userText && !imageFile) return;

    // If there's an image + text, send image first then text
    if (imageFile) {
      await handleImageSend(userText);
      return;
    }

    // Text only
    setInput('');
    const newMessages = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const reply = await sendToGroq(newMessages);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      console.error('Bot error:', err.message);
      let msg = "Oops! Something went wrong. Try again!";
      if (!GROQ_KEY) msg = "⚠️ VITE_GROQ_KEY is not set. Add it to Vercel Environment Variables and redeploy.";
      else if (err.message?.includes('401') || err.message?.includes('Invalid API Key')) msg = "⚠️ Invalid Groq API key. Check VITE_GROQ_KEY in Vercel settings.";
      else if (err.message?.includes('429')) msg = "⏳ Too many requests. Wait a moment and try again.";
      setMessages(prev => [...prev, { role: 'assistant', text: msg }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSend = async (extraText = '') => {
    const file = imageFile;
    const caption = extraText || input.trim() || 'What dish is this? Suggest a recipe!';

    setInput('');
    clearImage();

    // Show user message with image preview
    const imgUrl = URL.createObjectURL(file);
    setMessages(prev => [...prev, {
      role: 'user',
      text: caption,
      image: imgUrl,
    }]);
    setLoading(true);

    try {
      const reply = await analyzeImage(file);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: `Couldn't analyze the image: ${err.message}. Make sure VITE_GEMINI_KEY is set.`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleQuickPrompt = (p) => {
    if (p === '📸 Upload a food photo') {
      fileRef.current?.click();
    } else {
      sendMessage(p);
    }
  };

  return (
    <>
      <button
        className={`bot-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Open recipe assistant"
      >
        {open ? '✕' : '🍴'}
        {!open && <span className="bot-fab-label">Ask AI</span>}
      </button>

      <div className={`bot-window ${open ? 'bot-open' : ''}`}>
        {/* Header */}
        <div className="bot-header">
          <div className="bot-header-left">
            <div className="bot-avatar">🍴</div>
            <div>
              <div className="bot-name">Tasty AI</div>
              <div className="bot-status">
                <span className="bot-dot" /> Recipe Assistant + Vision
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
                {m.image && (
                  <img src={m.image} alt="uploaded food" className="bot-msg-img" />
                )}
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
              <button key={p} className={`bot-quick-btn ${p.includes('📸') ? 'bot-img-btn' : ''}`}
                onClick={() => handleQuickPrompt(p)}>
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Image preview */}
        {preview && (
          <div className="bot-img-preview">
            <img src={preview} alt="preview" />
            <button className="bot-img-remove" onClick={clearImage}>✕</button>
            <span className="bot-img-label">📸 Ready to analyze</span>
          </div>
        )}

        {/* Input row */}
        <div className="bot-input-row">
          {/* Hidden file input */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageSelect}
          />

          {/* Camera/upload button */}
          <button
            className="bot-img-upload-btn"
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            aria-label="Upload food image"
            title="Upload food photo for AI recognition"
          >
            📸
          </button>

          <textarea
            ref={inputRef}
            className="bot-input"
            placeholder={preview ? 'Add a question or just send the photo…' : 'Ask about recipes, ingredients…'}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            disabled={loading}
          />
          <button
            className="bot-send"
            onClick={() => sendMessage()}
            disabled={(!input.trim() && !imageFile) || loading}
            aria-label="Send"
          >
            ➤
          </button>
        </div>
      </div>
    </>
  );
}
