import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axiosClient";
import LogoCarro from "./LogoCarro";
import "./Login.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post("/auth/reset-password", {
        token,
        password,
      });
      setMensaje(data.message);
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.error || "El enlace de recuperación no es válido o ha expirado."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="login">
        <div className="login__card" style={{ textAlign: "center" }}>
          <p className="login__error">Token de recuperación no encontrado.</p>
          <Link to="/login" className="login__submit" style={{ textDecoration: "none" }}>
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="login">
      <video
        className="login__bg-video"
        autoPlay
        muted
        loop
        playsInline
        src="/bg-car.mp4"
      />
      <div className="login__overlay" />

      <div className="login__card">
        <div className="login__brand">
          <LogoCarro
            className="login__logo-svg"
            color="#F15A24"
            style={{ width: "220px", height: "auto", marginBottom: "8px" }}
          />
          <h1 className="login__title">
            AUTO<span>SPORT</span>
          </h1>
          <p className="login__subtitle">Crear Nueva Contraseña</p>
        </div>

        {mensaje ? (
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <p style={{ color: "var(--green)", marginBottom: "16px", fontSize: "14px" }}>
              {mensaje}
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
              Redirigiendo al inicio de sesión en 3 segundos...
            </p>
          </div>
        ) : (
          <form className="login__form" onSubmit={handleSubmit}>
            <div className="login__field">
              <label>Nueva Contraseña</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  style={{ width: "100%", paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px"
                  }}
                  tabIndex="-1"
                >
                  {showPass ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="login__field">
              <label>Confirmar Nueva Contraseña</label>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input
                  type={showConfirmPass ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu nueva contraseña"
                  required
                  style={{ width: "100%", paddingRight: "40px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--text-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px"
                  }}
                  tabIndex="-1"
                >
                  {showConfirmPass ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <p className="login__error">{error}</p>}

            <button
              type="submit"
              className="login__submit"
              disabled={loading}>
              {loading ? "Guardando..." : "Restablecer Contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}