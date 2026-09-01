import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "./Login.css";
import LogoCarro from "./LogoCarro";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bloqueado, setBloqueado] = useState(false);
  const [segRestantes, setSegRestantes] = useState(0);

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e, emailToAuth, passwordToAuth) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setLoading(true);
    setError("");
    try {
      await login(emailToAuth || form.email, passwordToAuth || form.password);
      const from = location.state?.from || "/dashboard";
      navigate(from);
    } catch (err) {
      // --- INTEGRACIÓN OFFLINE ---
      if (!navigator.onLine) {
        const userCached = localStorage.getItem("as_user");
        const tokenCached = localStorage.getItem("as_token");
        if (userCached && tokenCached) {
          const from = location.state?.from || "/dashboard";
          navigate(from);
          return;
        } else {
          setError(
            "Sin conexión y sin sesión previa guardada. Conéctate a internet para ingresar.",
          );
          setLoading(false);
          return;
        }
      }
      // --- FIN INTEGRACIÓN OFFLINE ---

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
          "Error de autenticación: Credenciales inválidas",
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
        <button className="login__theme" onClick={toggleTheme} type="button">
          {theme === "dark" ? "Modo Claro" : "Modo Oscuro"}
        </button>

        <div className="login__brand">
          <LogoCarro
            className="login__logo-svg"
            color="#F15A24"
            style={{ width: "260px", height: "auto", marginBottom: "8px" }}
          />
          <h1 className="login__title">
            AUTO<span>SPORT</span>
          </h1>
          <p className="login__subtitle">Sistema de Gestión de Accesorios</p>
        </div>

        <form
          className="login__form"
          onSubmit={(e) => handleSubmit(e, form.email, form.password)}>
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
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="login__error">{error}</p>}
          <button
            type="submit"
            className="login__submit"
            disabled={loading || bloqueado}>
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