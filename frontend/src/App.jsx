
import { useEffect, useState } from "react";
import {
  Send,
  Database,
  BookOpen,
  LoaderCircle,
  ExternalLink,
  Bot,
  User,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
  Trash2,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import "./App.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

const STORAGE_KEY = "ask-olake-chat-history-v1";

const suggestions = [
  "How does OLake ingestion work?",
  "How does Iceberg compaction work?",
  "How do I configure a PostgreSQL source?",
  "How can I troubleshoot sync failures?",
];

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getChatTitle(question) {
  const clean = question.trim().replace(/\s+/g, " ");
  return clean.length > 36 ? `${clean.slice(0, 36)}…` : clean;
}

function readSavedChats() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (chat) =>
        chat &&
        typeof chat.id === "string" &&
        Array.isArray(chat.messages)
    );
  } catch {
    return [];
  }
}

export default function App() {
  const [chats, setChats] = useState(readSavedChats);
  const [activeChatId, setActiveChatId] = useState(null);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const activeChat = chats.find((chat) => chat.id === activeChatId);
  const messages = activeChat?.messages || [];

  // Persist conversation history in this browser.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch (err) {
      console.error("Could not save Ask OLake chat history:", err);
      setError("Chat history could not be saved in this browser.");
    }
  }, [chats]);

  function startNewChat() {
    setActiveChatId(null);
    setQuestion("");
    setError("");
    setLoading(false);
    setMobileSidebarOpen(false);
  }

  function openChat(chatId) {
    if (loading) return;
    setActiveChatId(chatId);
    setQuestion("");
    setError("");
    setMobileSidebarOpen(false);
  }

  function deleteChat(event, chatId) {
    event.stopPropagation();

    setChats((old) => old.filter((chat) => chat.id !== chatId));

    if (activeChatId === chatId) {
      setActiveChatId(null);
      setQuestion("");
      setError("");
    }
  }

  async function askQuestion(text = question) {
    const q = text.trim();
    if (!q || loading) return;

    const chatId = activeChatId || createId();
    const timestamp = new Date().toISOString();

    const userMessage = {
      role: "user",
      text: q,
      timestamp,
    };

    // Create a new saved conversation or append to the selected one.
    setChats((old) => {
      const existing = old.find((chat) => chat.id === chatId);

      if (existing) {
        return old.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                updatedAt: timestamp,
                messages: [...chat.messages, userMessage],
              }
            : chat
        );
      }

      return [
        {
          id: chatId,
          title: getChatTitle(q),
          createdAt: timestamp,
          updatedAt: timestamp,
          messages: [userMessage],
        },
        ...old,
      ];
    });

    setActiveChatId(chatId);
    setQuestion("");
    setError("");
    setLoading(true);
    setMobileSidebarOpen(false);

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

      const assistantMessage = {
        role: "assistant",
        text: data.answer || "I couldn't generate an answer.",
        sources: Array.isArray(data.sources) ? data.sources : [],
        timestamp: new Date().toISOString(),
      };

      setChats((old) =>
        old.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                updatedAt: assistantMessage.timestamp,
                messages: [...chat.messages, assistantMessage],
              }
            : chat
        )
      );
    } catch (err) {
      setError(
        `Couldn't reach Ask OLake: ${err.message}. Check that the backend is running.`
      );
    } finally {
      setLoading(false);
    }
  }

  const sortedChats = [...chats].sort(
    (a, b) => new Date(b.updatedAt || b.createdAt) -
      new Date(a.updatedAt || a.createdAt)
  );

  return (
    <div className={`app-shell ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
      {mobileSidebarOpen && (
        <button
          className="mobile-backdrop"
          aria-label="Close sidebar"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`sidebar ${sidebarOpen ? "" : "sidebar-hidden"} ${
          mobileSidebarOpen ? "mobile-sidebar-open" : ""
        }`}
        aria-label="Chat history sidebar"
      >
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <Database size={21} />
            </div>
            <span>Ask OLake</span>
          </div>

          <button
            className="icon-button sidebar-close-mobile"
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <button className="new-chat-button" onClick={startNewChat}>
          <Plus size={18} />
          <span>New chat</span>
        </button>

        <div className="history-heading">YOUR HISTORY</div>

        <div className="history-list">
          {sortedChats.length === 0 ? (
            <div className="history-empty">
              <MessageSquare size={19} />
              <span>Your conversations will appear here.</span>
            </div>
          ) : (
            sortedChats.map((chat) => (
              <div
                className={`history-item ${
                  chat.id === activeChatId ? "history-item-active" : ""
                }`}
                key={chat.id}
              >
                <button
                  className="history-select"
                  onClick={() => openChat(chat.id)}
                  disabled={loading}
                  title={chat.title}
                >
                  <MessageSquare size={15} />
                  <span>{chat.title || "New conversation"}</span>
                </button>

                <button
                  className="history-delete"
                  onClick={(event) => deleteChat(event, chat.id)}
                  aria-label={`Delete ${chat.title}`}
                  title="Delete conversation"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-footer-icon">
            <Database size={16} />
          </div>
          <div>
            <strong>OLake Documentation AI</strong>
            <span>History saved in this browser</span>
          </div>
        </div>
      </aside>

      <div className="main-panel">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button desktop-sidebar-toggle"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? (
                <PanelLeftClose size={20} />
              ) : (
                <PanelLeftOpen size={20} />
              )}
            </button>

            <button
              className="icon-button mobile-menu-button"
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open chat history"
            >
              <Menu size={20} />
            </button>

            <div className="brand">
              <div className="brand-icon topbar-brand-icon">
                <Database size={21} />
              </div>
              <div>
                <h1>Ask OLake</h1>
                <span>Documentation AI assistant</span>
              </div>
            </div>
          </div>

          <div className="status">
            <span /> OLake Knowledge Base
          </div>
        </header>

        <main className="chat-layout">
          {messages.length === 0 ? (
            <section className="hero">
             

<div className="hero-icon react-orbit" aria-label="Animated OLake technology symbol">
  <svg
    className="orbit-svg"
    viewBox="0 0 200 160"
    role="img"
    aria-label="Glowing atom with orbiting particles"
  >
    <defs>
      <radialGradient id="coreGlow">
        <stop offset="0%" stopColor="#baffdf" />
        <stop offset="45%" stopColor="#36f5b0" />
        <stop offset="100%" stopColor="#00bfa5" />
      </radialGradient>

      <filter id="particleGlow" x="-200%" y="-200%" width="400%" height="400%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    <g className="orbit-lines">
      <ellipse className="orbit-path orbit-path-one" cx="100" cy="80" rx="76" ry="27" />
      <ellipse className="orbit-path orbit-path-two" cx="100" cy="80" rx="76" ry="27" transform="rotate(60 100 80)" />
      <ellipse className="orbit-path orbit-path-three" cx="100" cy="80" rx="76" ry="27" transform="rotate(-60 100 80)" />
    </g>

    <circle className="react-core-halo" cx="100" cy="80" r="19" />
    <circle className="react-core" cx="100" cy="80" r="10" fill="url(#coreGlow)" />

    <g className="orbit-particle particle-one" filter="url(#particleGlow)">
      <circle cx="100" cy="53" r="4" />
    </g>

    <g className="orbit-particle particle-two" filter="url(#particleGlow)">
      <circle cx="100" cy="53" r="3.5" />
    </g>

    <g className="orbit-particle particle-three" filter="url(#particleGlow)">
      <circle cx="100" cy="53" r="3" />
    </g>
  </svg>
</div>



              <p className="eyebrow">YOUR OLAKE COPILOT</p>

              <h2>
                Understand your data.
                <br />
                <span>Ask anything about OLake.</span>
              </h2>

              <p className="hero-description">
                Get documentation-grounded guidance for ingestion, Iceberg,
                Fusion maintenance, deployment, and troubleshooting.
              </p>
            </section>
          ) : (
            <section className="active-chat-heading">
              <div className="active-chat-symbol">
                <Sparkles size={18} />
              </div>
              <div>
                <span>YOUR OLAKE COPILOT</span>
                <h2>{activeChat?.title || "OLake conversation"}</h2>
              </div>
            </section>
          )}

          <section className="conversation" aria-live="polite">
            {messages.length === 0 && (
              <div className="welcome">
                <h3>
                  <BookOpen size={18} /> Start with a question
                </h3>
                <div className="suggestions">
                  {suggestions.map((item) => (
                    <button
                      className="suggestion"
                      key={item}
                      onClick={() => askQuestion(item)}
                      disabled={loading}
                    >
                      {item}
                      <span>↗</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <article className={`message ${message.role}`} key={`${message.timestamp || ""}-${index}`}>
                <div className="avatar">
                  {message.role === "assistant" ? (
                    <Bot size={19} />
                  ) : (
                    <User size={19} />
                  )}
                </div>

                <div className="message-content">
                  <strong>
                    {message.role === "assistant" ? "Ask OLake" : "You"}
                  </strong>
                  <p className="answer-text">{message.text}</p>

                  {message.sources?.length > 0 && (
                    <div className="sources">
                      <strong>
                        <BookOpen size={15} /> Sources
                      </strong>
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
            <button
              type="submit"
              disabled={loading || !question.trim()}
              aria-label="Send question"
            >
              {loading ? (
                <LoaderCircle className="spin" />
              ) : (
                <Send size={19} />
              )}
            </button>
          </form>

          <p className="disclaimer">
            AI-generated answers can be imperfect. Verify important commands
            against the cited documentation.
          </p>
        </main>
      </div>
    </div>
  );
}
