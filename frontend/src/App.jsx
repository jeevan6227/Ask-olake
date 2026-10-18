
import { useState } from "react";
import {
  Send,
  Database,
  Sparkles,
  BookOpen,
  LoaderCircle,
  ExternalLink,
  Bot,
  User,
} from "lucide-react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const suggestions = [
  "How does OLake ingestion work?",
  "How does Iceberg compaction work?",
  "How do I configure a PostgreSQL source?",
  "How can I troubleshoot sync failures?",
];

export default function App() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function askQuestion(text = question) {
    const q = text.trim();
    if (!q || loading) return;

    setMessages((old) => [...old, { role: "user", text: q }]);
    setQuestion("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "The server could not answer.");
      }

      setMessages((old) => [
        ...old,
        {
          role: "assistant",
          text: data.answer || "I couldn't generate an answer.",
          sources: Array.isArray(data.sources) ? data.sources : [],
        },
      ]);
    } catch (err) {
      setError(
        `Couldn't reach Ask OLake: ${err.message}. Check that the backend is running.`
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon"><Database size={22} /></div>
          <div>
            <h1>Ask OLake</h1>
            <span>Documentation AI assistant</span>
          </div>
        </div>
        <div className="status"><span /> OLake Knowledge Base</div>
      </header>

      <main className="chat-layout">
        <section className="hero">
          <div className="hero-icon"><Sparkles size={25} /></div>
          <p className="eyebrow">YOUR OLake COPILOT</p>
          <h2>Understand your data.<br /><span>Ask anything about OLake.</span></h2>
          <p className="hero-description">
            Get documentation-grounded guidance for ingestion, Iceberg,
            Fusion maintenance, deployment, and troubleshooting.
          </p>
        </section>

        <section className="conversation" aria-live="polite">
          {messages.length === 0 && (
            <div className="welcome">
              <h3><BookOpen size={18} /> Start with a question</h3>
              <div className="suggestions">
                {suggestions.map((item) => (
                  <button
                    className="suggestion"
                    key={item}
                    onClick={() => askQuestion(item)}
                    disabled={loading}
                  >
                    {item}<span>↗</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <article className={`message ${message.role}`} key={index}>
              <div className="avatar">
                {message.role === "assistant" ? <Bot size={19} /> : <User size={19} />}
              </div>
              <div className="message-content">
                <strong>{message.role === "assistant" ? "Ask OLake" : "You"}</strong>
                <p className="answer-text">{message.text}</p>
                {message.sources?.length > 0 && (
                  <div className="sources">
                    <strong><BookOpen size={15} /> Sources</strong>
                    {message.sources.map((source, i) => (
                      <a
                        key={`${source}-${i}`}
                        href={source}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Source {i + 1} <ExternalLink size={13} />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}

          {loading && (
            <div className="loading">
              <LoaderCircle className="spin" size={20} />
              Searching OLake documentation...
            </div>
          )}
          {error && <div className="error-message">{error}</div>}
        </section>

        <form
          className="composer"
          onSubmit={(event) => {
            event.preventDefault();
            askQuestion();
          }}
        >
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask about OLake ingestion, Fusion, catalogs..."
            aria-label="Ask an OLake question"
            maxLength={2000}
          />
          <button type="submit" disabled={loading || !question.trim()} aria-label="Send question">
            {loading ? <LoaderCircle className="spin" /> : <Send size={19} />}
          </button>
        </form>
        <p className="disclaimer">
          AI-generated answers can be imperfect. Verify important commands against the cited documentation.
        </p>
      </main>
    </div>
  );
}
