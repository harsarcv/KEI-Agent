import { useEffect, useState } from "react";

const KnowledgeBase = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    source: "",
    content: "",
  });

  const fetchKnowledgeBase = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Session login tidak ditemukan.");
      }

      const response = await fetch(
        "http://localhost:5000/api/knowledge",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal mengambil knowledge base."
        );
      }

      setDocuments(result.data || []);
    } catch (error) {
      console.error(
        "Knowledge Base Error:",
        error.message
      );

      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  const embeddedDocuments = documents.filter(
    (document) => document.has_embedding
  ).length;

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    const title = formData.title.trim();
    const source = formData.source.trim();
    const content = formData.content.trim();

    if (!title) {
      setFormError("Judul dokumen wajib diisi.");
      return;
    }

    if (!content) {
      setFormError("Isi dokumen wajib diisi.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Session login tidak ditemukan.");
      }

      const response = await fetch(
        "http://localhost:5000/api/knowledge",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            source: source || null,
            content,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Gagal menambahkan dokumen."
        );
      }

      setFormData({
        title: "",
        source: "",
        content: "",
      });

      setFormError("");
      setShowForm(false);

      await fetchKnowledgeBase();
    } catch (error) {
      console.error(
        "Add Knowledge Error:",
        error.message
      );

      setFormError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (saving) {
      return;
    }

    setFormData({
      title: "",
      source: "",
      content: "",
    });

    setFormError("");
    setShowForm(false);
  };

  return (
    <main className="main-content">
      {/* =========================
          TOP BAR
      ========================= */}

      <header className="topbar">
        <div>
          <p className="eyebrow">
            RUMLIV BUSINESS
          </p>

          <h2>Knowledge Base</h2>
        </div>

        <div className="status">
          <span className="status-dot"></span>
          System Online
        </div>
      </header>

      {/* =========================
          INTRO
      ========================= */}

      <section className="knowledge-header">
        <div>
          <p className="eyebrow">
            KNOWLEDGE MANAGEMENT
          </p>

          <h3>RUMLIV Knowledge Base</h3>

          <p>
            Kelola informasi internal yang digunakan
            KEI sebagai sumber pengetahuan dalam
            proses analisis.
          </p>
        </div>

        <span className="section-badge">
          PostgreSQL + RAG
        </span>
      </section>

      {/* =========================
          STATISTICS
      ========================= */}

      <section className="stats-grid knowledge-stats">
        <div className="stat-card">
          <div className="stat-icon products">
            ▣
          </div>

          <div>
            <span>Total Documents</span>

            <strong>
              {loading ? "..." : documents.length}
            </strong>

            <small>
              Knowledge PostgreSQL
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon ai">
            ✦
          </div>

          <div>
            <span>Embedded Documents</span>

            <strong>
              {loading
                ? "..."
                : embeddedDocuments}
            </strong>

            <small>
              Ready for vector search
            </small>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon customers">
            ✓
          </div>

          <div>
            <span>RAG Status</span>

            <strong>
              {loading ? "..." : "Ready"}
            </strong>

            <small>
              Gemini Embedding
            </small>
          </div>
        </div>
      </section>

      {/* =========================
          ADD DOCUMENT
      ========================= */}

      <section className="knowledge-card add-document-card">
        <div className="section-heading">
          <div>
            <span>KNOWLEDGE MANAGEMENT</span>

            <h3>Tambah Dokumen</h3>
          </div>

          {!showForm && (
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setShowForm(true);
                setFormError("");
              }}
            >
              + Tambah Dokumen
            </button>
          )}
        </div>

        {showForm && (
          <form
            className="knowledge-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label htmlFor="title">
                Judul Dokumen
              </label>

              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Contoh: Kebijakan Retur RUMLIV"
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="source">
                Sumber
              </label>

              <input
                id="source"
                name="source"
                type="text"
                value={formData.source}
                onChange={handleInputChange}
                placeholder="Contoh: Kebijakan Internal RUMLIV"
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">
                Isi Dokumen
              </label>

              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Masukkan informasi yang ingin digunakan KEI sebagai knowledge..."
                rows={8}
                disabled={saving}
              />
            </div>

            {formError && (
              <div className="form-error">
                {formError}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleCancel}
                disabled={saving}
              >
                Batal
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Menyimpan..."
                  : "Simpan Dokumen"}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* =========================
          DOCUMENTS
      ========================= */}

      <section className="knowledge-card">
        <div className="section-heading">
          <div>
            <span>KNOWLEDGE DOCUMENTS</span>

            <h3>Documents</h3>
          </div>

          <span className="section-badge">
            {documents.length} Documents
          </span>
        </div>

        {loading ? (
          <div className="knowledge-loading">
            <div className="loading-spinner"></div>

            <span>
              Memuat knowledge base...
            </span>
          </div>
        ) : error ? (
          <div className="knowledge-error">
            <strong>
              Gagal memuat knowledge base
            </strong>

            <span>{error}</span>

            <button
              className="secondary-button"
              onClick={fetchKnowledgeBase}
            >
              Coba Lagi
            </button>
          </div>
        ) : documents.length === 0 ? (
          <div className="knowledge-empty">
            <div className="empty-icon">
              ◫
            </div>

            <strong>
              Belum ada dokumen
            </strong>

            <span>
              Knowledge base RUMLIV belum memiliki
              dokumen.
            </span>
          </div>
        ) : (
          <div className="document-list">
            {documents.map((document) => (
              <div
                className="document-item"
                key={document.id}
              >
                <div className="document-icon">
                  ◫
                </div>

                <div className="document-info">
                  <strong>
                    {document.title}
                  </strong>

                  <span>
                    {document.source ||
                      "Internal Knowledge"}
                  </span>

                  <small>
                    Ditambahkan{" "}
                    {formatDate(
                      document.created_at
                    )}
                  </small>
                </div>

                <div
                  className={`embedding-status ${
                    document.has_embedding
                      ? "ready"
                      : "pending"
                  }`}
                >
                  <span>
                    {document.has_embedding
                      ? "✓"
                      : "!"}
                  </span>

                  {document.has_embedding
                    ? "Embedded"
                    : "Not Embedded"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default KnowledgeBase;