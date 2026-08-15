import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../chatbot.css";

const SUGGESTED_QUESTIONS = [
  "List 2BHK flats",
  "How to book a flat?",
  "What are the maintenance charges?",
  "Are there any new notices?"
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("website");
  
  const initialMessage = { text: "Hi there! I am AuraHeights Assistant. How can I help you today?", isBot: true };
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e, customText = null) => {
    if (e) e.preventDefault();
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    const userMessage = { text: textToSend, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("https://auraheight.onrender.com/chat", { message: userMessage.text, mode });
      setMessages((prev) => [...prev, { text: res.data.reply, isBot: true }]);
    } catch (error) {
      setMessages((prev) => [...prev, { text: "Sorry, I am having trouble answering right now.", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([initialMessage]);
  };

  return (
    <div className={`chatbot-container ${isOpen ? "open" : ""}`}>
      {/* Chat Window */}
      <div className={`chatbot-window ${isOpen ? "active" : ""}`}>
        <div className="chatbot-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>âœ¨</span>
            <div>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>AuraHeights Assistant</h4>
              <p style={{ margin: 0, fontSize: 12, opacity: 0.9 }}>Online & ready to help</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="chatbot-icon-btn" onClick={clearChat} title="Clear Chat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
            <button className="chatbot-icon-btn" onClick={() => setIsOpen(false)} title="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <div className="chatbot-mode-toggle">
          <button 
            className={`mode-btn ${mode === "website" ? "active" : ""}`}
            onClick={() => setMode("website")}
          >
            Website Info
          </button>
          <button 
            className={`mode-btn ${mode === "assistant" ? "active" : ""}`}
            onClick={() => setMode("assistant")}
          >
            AI Assistant
          </button>
        </div>
        
        <div className="chatbot-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.isBot ? "bot" : "user"}`}>
              <div className="chat-bubble">{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-message bot">
              <div className="chat-bubble typing">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="chatbot-suggestions">
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px", paddingLeft: 4 }}>Suggested Questions</div>
            <div className="suggestions-scroll">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button key={idx} className="suggestion-chip" onClick={() => handleSend(null, q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <form className="chatbot-input-area" onSubmit={(e) => handleSend(e)}>
          <input 
            type="text" 
            placeholder="Ask AuraHeights something..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()} title="Send Message">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </form>
      </div>

      {/* Toggle Button */}
      <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        )}
      </button>
    </div>
  );
}