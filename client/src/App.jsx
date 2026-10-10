import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Login from "./pages/Login";
import Analytics from "./pages/Analytics";
import KnowledgeBase from "./pages/KnowledgeBase";
import "./App.css";

const renderAIText = (text) => {
  if (!text) return null;

  const cleanedText = text
    .replace(/&#x20;/gi, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\\#/g, "#")
    .replace(/\\_/g, "_")
    .replace(/\\\*\*/g, "**")
    .replace(/\\\*/g, "*");

  return (
    <div className="ai-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h3 className="ai-md-heading">{children}</h3>
          ),

          h2: ({ children }) => (
            <h3 className="ai-md-heading">{children}</h3>
          ),

          h3: ({ children }) => (
            <h4 className="ai-md-subheading">{children}</h4>
          ),

          h4: ({ children }) => (
            <h4 className="ai-md-subheading">{children}</h4>
          ),

          p: ({ children }) => (
            <p className="ai-md-paragraph">{children}</p>
          ),

          strong: ({ children }) => (
            <strong className="ai-md-bold">{children}</strong>
          ),

          em: ({ children }) => (
            <span className="ai-md-emphasis">{children}</span>
          ),

          ul: ({ children }) => (
            <ul className="ai-md-list">{children}</ul>
          ),

          ol: ({ children }) => (
            <ol className="ai-md-list ai-md-ordered-list">
              {children}
            </ol>
          ),

          li: ({ children }) => (
            <li className="ai-md-list-item">{children}</li>
          ),

          hr: () => (
            <hr className="ai-md-divider" />
          ),

          blockquote: ({ children }) => (
            <blockquote className="ai-md-quote">
              {children}
            </blockquote>
          ),

          code: ({ children }) => (
            <code className="ai-md-inline-code">
              {children}
            </code>
          ),
        }}
      >
        {cleanedText}
      </ReactMarkdown>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!savedUser || !token) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  });

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Ref untuk area chat agar otomatis scroll ke pesan terbaru
  const conversationRef = useRef(null);

  const [analysisPhase, setAnalysisPhase] = useState(
    "sedang memahami pertanyaan"
  );

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [monthlyRevenueLoading, setMonthlyRevenueLoading] =
    useState(true);

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setMessages([]);
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    const fetchDashboardAnalytics = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        handleLogout();
        return;
      }

      try {
        setAnalyticsLoading(true);

        const response = await fetch(
          "http://localhost:5000/api/analytics/dashboard",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            handleLogout();
            return;
          }

          throw new Error(
            "Gagal mengambil data dashboard"
          );
        }

        const data = await response.json();

        setAnalytics(data.data);
      } catch (error) {
        console.error(
          "Dashboard Analytics Error:",
          error.message
        );
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchDashboardAnalytics();
  }, [user]);

  useEffect(() => {
    if (!conversationRef.current) {
      return;
    }

    conversationRef.current.scrollTo({
      top: conversationRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    const fetchMonthlyRevenue = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch(
          "http://localhost:5000/api/analytics/monthly-revenue",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
            "Gagal mengambil revenue bulanan"
          );
        }

        setMonthlyRevenue(result.data || []);
      } catch (error) {
        console.error(
          "Monthly Revenue Error:",
          error.message
        );
      } finally {
        setMonthlyRevenueLoading(false);
      }
    };

    fetchMonthlyRevenue();
  }, []);

  const sendMessage = async (text = message) => {
    const trimmedMessage = text.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      handleLogout();
      return;
    }

    // Ambil riwayat percakapan sebelum pesan baru ditambahkan
    const history = messages
      .filter(
        (item) =>
          item &&
          (item.role === "user" || item.role === "assistant") &&
          typeof item.text === "string" &&
          item.text.trim()
      )
      .slice(-10)
      .map((item) => ({
        role: item.role,
        text: item.text.trim(),
      }));

    setMessage("");
    setLoading(true);

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        text: trimmedMessage,
      },
      {
        role: "assistant",
        text: "",
        metadata: null,
      },
    ]);

    try {
      const response = await fetch(
        "http://localhost:5000/api/ai/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: trimmedMessage,
            history,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = "Gagal menghubungi KEI.";

        try {
          const errorData = await response.json();
          errorMessage =
            errorData.message || errorMessage;
        } catch {
          // Response bukan JSON
        }

        if (response.status === 401) {
          handleLogout();
          throw new Error(
            "Sesi login sudah tidak valid. Silakan login kembali."
          );
        }

        throw new Error(errorMessage);
      }

      if (!response.body) {
        throw new Error(
          "Streaming response tidak tersedia."
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, {
          stream: true,
        });

        const events = buffer.split("\n\n");

        buffer = events.pop() || "";

        for (const event of events) {
          if (!event.startsWith("data: ")) {
            continue;
          }

          const data = event.slice(6);

          if (data === "[DONE]") {
            continue;
          }

          let parsed;

          try {
            parsed = JSON.parse(data);
          } catch {
            continue;
          }

          if (parsed.type === "status") {
            const statusMessages = {
              understanding:
                "sedang memahami pertanyaan",

              analyzing:
                "sedang menganalisis data",

              searching:
                "sedang mencari data",

              processing:
                "sedang memproses hasil",

              composing:
                "sedang menyusun jawaban",
            };

            setAnalysisPhase(
              statusMessages[parsed.status] ||
              "sedang memproses permintaan"
            );
          }

          if (parsed.type === "chunk") {
            setMessages((previous) => {
              const updated = [...previous];
              const lastIndex = updated.length - 1;

              if (
                updated[lastIndex]?.role ===
                "assistant"
              ) {
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  text:
                    updated[lastIndex].text +
                    parsed.text,
                };
              }

              return updated;
            });
          }

          if (parsed.type === "complete") {
            setMessages((previous) => {
              const updated = [...previous];
              const lastIndex = updated.length - 1;

              if (
                updated[lastIndex]?.role ===
                "assistant"
              ) {
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  metadata: parsed.data,
                };
              }

              return updated;
            });
          }

          if (parsed.type === "error") {
            throw new Error(parsed.message);
          }
        }
      }
    } catch (error) {
      setMessages((previous) => {
        const updated = [...previous];
        const lastIndex = updated.length - 1;

        if (
          updated[lastIndex]?.role === "assistant"
        ) {
          updated[lastIndex] = {
            ...updated[lastIndex],
            text:
              error.message ||
              "Terjadi kesalahan saat memproses pertanyaan.",
            isError: true,
          };
        }

        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      sendMessage();
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">K</div>

          <div>
            <h1>KEI</h1>
            <span>Business Intelligence</span>
          </div>
        </div>

        <nav className="navigation">
          <button
            className={`nav-item ${activePage === "dashboard" ? "active" : ""
              }`}
            onClick={() => setActivePage("dashboard")}
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={`nav-item ${activePage === "analytics" ? "active" : ""
              }`}
            onClick={() => setActivePage("analytics")}
          >
            <span>▣</span>
            Analytics
          </button>

          <button
            className={`nav-item ${activePage === "knowledge"
              ? "active"
              : ""
              }`}
            onClick={() => setActivePage("knowledge")}
          >
            <span>◫</span>
            Knowledge Base
          </button>
        </nav>

        <div className="sidebar-bottom">

          <div className="user-card">
            <div className="avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            <div className="user-info">
              <strong>{user.name}</strong>
              <span>{user.role}</span>
            </div>

            <button
              className="logout-button"
              onClick={handleLogout}
              title="Logout"
            >
              ↪
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      {activePage === "analytics" ? (
        <Analytics
          analytics={analytics}
          analyticsLoading={analyticsLoading}
          monthlyRevenue={monthlyRevenue}
          monthlyRevenueLoading={monthlyRevenueLoading}
        />
      ) : activePage === "knowledge" ? (
        <KnowledgeBase />
      ) : (
        <main className="main-content">
          <header className="topbar">
            <div>
              <p className="eyebrow">
                RUMLIV BUSINESS
              </p>

              <h2>Dashboard</h2>
            </div>

            <div className="status">
              <span className="status-dot"></span>
              System Online
            </div>
          </header>

          {/* WELCOME */}
          <section className="welcome">
            <div>
              <p className="welcome-label">
                AI BUSINESS INTELLIGENCE
              </p>

              <h3>
                Selamat datang kembali,
                <br />

                <span>
                  KEI siap membantu
                  analisis bisnis.
                </span>
              </h3>

              <p className="welcome-description">
                Analisis data RUMLIV menggunakan AI,
                PostgreSQL, dan knowledge base dalam
                satu tempat.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={() => {
                document
                  .querySelector(".chat-input textarea")
                  ?.focus();
              }}
            >
              ✦ Mulai Analisis
            </button>
          </section>

          {/* AI ASSISTANT */}
          <section className="assistant-card">
            <div className="assistant-header">
              <div className="assistant-title">
                <div className="ai-logo">✦</div>

                <div>
                  <h3>KEI AI Assistant</h3>

                  <p>
                    Ask anything about RUMLIV business
                    data
                  </p>
                </div>
              </div>

              <span className="badge">
                {loading ? "ANALYZING" : "AI READY"}
              </span>
            </div>

            <div className="assistant-content">
              {/* Initial greeting */}
              {messages.length === 0 && (
                <>
                  <div className="assistant-message">

                    <div className="message-bubble">
                      <strong>KEI</strong>

                      <p>
                        Halo! Saya KEI. Saya dapat
                        membantu kamu menganalisis
                        performa bisnis RUMLIV,
                        mencari informasi dari
                        knowledge base, dan memberikan
                        insight berdasarkan data.
                      </p>
                    </div>
                  </div>

                  <div className="suggestions">
                    <button
                      onClick={() =>
                        sendMessage(
                          "Produk apa yang paling banyak terjual?"
                        )
                      }
                    >
                      📊 Produk apa yang paling banyak
                      terjual?
                    </button>

                    <button
                      onClick={() =>
                        sendMessage(
                          "Berapa total revenue RUMLIV?"
                        )
                      }
                    >
                      💰 Berapa total revenue RUMLIV?
                    </button>

                    <button
                      onClick={() =>
                        sendMessage(
                          "Apa kebijakan retur RUMLIV?"
                        )
                      }
                    >
                      📚 Apa kebijakan retur RUMLIV?
                    </button>
                  </div>
                </>
              )}

              {/* Conversation */}
              {messages.length > 0 && (
                <div className="conversation" ref={conversationRef}>
                  {messages.map((item, index) => (
                    <div
                      className={`chat-message ${item.role === "assistant" ? "assistant" : "user"
                        }`}
                      key={index}
                    >
                      <div className="chat-sender">
                        {item.role === "assistant" ? "KEI" : "You"}
                      </div>

                      <div
                        className={`chat-bubble ${item.isError ? "chat-error" : ""
                          }`}
                      >
                        {item.text ? (
                          item.role === "assistant" ? (
                            renderAIText(item.text)
                          ) : (
                            <p>{item.text}</p>
                          )
                        ) : loading &&
                          index === messages.length - 1 &&
                          item.role === "assistant" ? (
                          <p className="typing-message">
                            {analysisPhase}
                            <span className="loading-dots">
                              <span>.</span>
                              <span>.</span>
                              <span>.</span>
                            </span>
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* INPUT */}
              <div className="chat-input">
                <textarea
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Tanyakan sesuatu tentang bisnis RUMLIV..."
                  rows={1}
                  disabled={loading}
                />

                <button
                  onClick={() => sendMessage()}
                  disabled={
                    loading || !message.trim()
                  }
                  title="Kirim"
                >
                  {loading ? "..." : "➤"}
                </button>
              </div>

              <p className="input-hint">
                Enter untuk mengirim · Shift + Enter
                untuk baris baru
              </p>
            </div>
          </section>
        </main>
      )}
    </div>
  );
}



export default App;