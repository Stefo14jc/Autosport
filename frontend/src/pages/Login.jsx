import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../api/axiosClient";
import LogoCarro from "./LogoCarro";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);
  const [segRestantes, setSegRestantes] = useState(0);

  // Estado para el contador público de accesorios
  const [totalProductos, setTotalProductos] = useState(null);

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Consulta pública del total de repuestos/accesorios
    api
      .get("/accesorios/public-count")
      .then((res) => setTotalProductos(res.data.total))
      .catch(() => setTotalProductos(null));
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setLoading(true);
    setError("");
    try {
      await login(form.email, form.password);
      const from = location.state?.from || "/dashboard";
      navigate(from);
    } catch (err) {
      if (!navigator.onLine) {
        const userCached = localStorage.getItem("as_user");
        const tokenCached = localStorage.getItem("as_token");
        if (userCached && tokenCached) {
          const from = location.state?.from || "/dashboard";
          navigate(from);
          return;
        } else {
          setError(
            "Sin conexión y sin sesión previa guardada. Conéctate a internet para ingresar."
          );
          setLoading(false);
          return;
        }
      }

      if (err.response?.status === 429) {
        setBloqueado(true);
        let seg = 300;
        setSegRestantes(seg);
        const timer = setInterval(() => {
          seg--;
          setSegRestantes(seg);
          if (seg <= 0) {
            clearInterval(timer);
            setBloqueado(false);
          }
        }, 1000);
      }
      setError(
        err.response?.data?.error ||
          "Error de autenticación: Credenciales inválidas"
      );
      setForm({ email: "", password: "" });
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
        <div className="login__top-bar" style={{ justifyContent: "flex-end" }}>
          <button className="login__theme" onClick={toggleTheme} type="button">
            {theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
          </button>
        </div>

        <div className="login__brand">
          <LogoCarro
            className="login__logo-svg"
            color="#F15A24"
            style={{ width: "240px", height: "auto", marginBottom: "8px" }}
          />
          <h1 className="login__title">
            AUTO<span>SPORT</span>
          </h1>
          <p className="login__subtitle">Sistema de Gestión de Accesorios</p>

          {totalProductos !== null && (
            <div className="login__counter-badge">
              📦 Catálogo: <strong>{totalProductos}</strong> accesorios registrados
            </div>
          )}
        </div>

        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field">
            <label>Usuario o Email</label>
            <input
              name="email"
              type="text"
              value={form.email}
              onChange={handleChange}
              placeholder="username / usuario@autosport.com"
              required
            />
          </div>

          <div className="login__field">
            <label>Contraseña</label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                style={{ width: "100%", paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
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
                {showPassword ? (
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

            <div style={{ textAlign: "right", marginTop: "6px" }}>
              <Link
                to="/forgot-password"
                style={{
                  fontSize: "12px",
                  color: "var(--orange)",
                  textDecoration: "none",
                }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          {error && <p className="login__error">{error}</p>}

          <button
            type="submit"
            className="login__submit"
            disabled={loading || bloqueado}
          >
            {bloqueado
              ? `Bloqueado ${segRestantes}s`
              : loading
                ? "Verificando..."
                : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}