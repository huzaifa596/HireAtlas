import { useState, useRef, useEffect } from "react";
import API from "../../services/api";
import "./Chatbot.css";

const Chatbot = () => {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm your HireAtlas career assistant. Ask me anything about jobs, resumes, or interviews! 🎯" }
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      // send only role+content to backend (exclude the initial greeting from history)
      const history = updated.map(({ role, content }) => ({ role, content }));
      const { data } = await API.post("/chat", { messages: history });
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating bubble */}
      <button className="chat-bubble" onClick={() => setOpen(o => !o)} aria-label="Open chat">
        {open ? "✕" : "💬"}
      </button>

      {/* Chat window */}
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <span>🎯 HireAtlas Assistant</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg chat-msg--${msg.role}`}>
                <div className="chat-msg__bubble">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-msg chat-msg--assistant">
                <div className="chat-msg__bubble chat-msg__bubble--typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="chat-input-row">
            <textarea
              className="chat-input"
              placeholder="Ask about jobs, resumes, interviews..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
            />
            <button className="chat-send" onClick={sendMessage} disabled={loading || !input.trim()}>
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;