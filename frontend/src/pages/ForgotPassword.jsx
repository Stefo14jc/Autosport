import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosClient";
import LogoCarro from "./LogoCarro";
import "./Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMensaje("");

    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMensaje(data.message || "Se ha enviado un correo con las instrucciones.");
      setEmail("");
    } catch (err) {
      setError(
        err.response?.data?.error || "Error al solicitar la recuperación."
      );
    } finally {
      setLoading(false);
    }
  };

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
          <p className="login__subtitle">Recuperación de Contraseña</p>
        </div>

        {mensaje ? (
          <div style={{ textAlign: "center", margin: "20px 0" }}>
            <p style={{ color: "var(--green)", marginBottom: "16px", fontSize: "14px" }}>
              {mensaje}
            </p>
            <Link to="/login" className="login__submit" style={{ textDecoration: "none", display: "inline-block" }}>
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form className="login__form" onSubmit={handleSubmit}>
            <div className="login__field">
              <label>Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu_correo@autosport.com"
                required
              />
            </div>

            {error && <p className="login__error">{error}</p>}

            <button
              type="submit"
              className="login__submit"
              disabled={loading}>
              {loading ? "Enviando..." : "Enviar enlace de recuperación"}
            </button>

            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <Link to="/login" style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                ← Volver al inicio de sesión
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}