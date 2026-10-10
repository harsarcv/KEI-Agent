import { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login gagal."
        );
      }

      localStorage.setItem(
        "token",
        data.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.data.user)
      );

      onLogin(data.data.user);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="login-logo">K</div>

          <div>
            <h1>KEI</h1>
            <p>Business Intelligence Assistant</p>
          </div>
        </div>

        <div className="login-heading">
          <span>WELCOME BACK</span>

          <h2>
            Masuk ke
            <br />
            <strong>KEI Dashboard</strong>
          </h2>

          <p>
            Kelola dan analisis data bisnis RUMLIV
            menggunakan AI.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="admin@kei.local"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Masukkan password"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Memverifikasi..."
              : "Masuk ke Dashboard"}
          </button>
        </form>

        <div className="login-footer">
          <span>KEI</span>
          <span>RUMLIV Business Intelligence</span>
        </div>
      </section>
    </main>
  );
}

export default Login;