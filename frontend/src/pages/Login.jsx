import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "./Login.css";
import LogoCarro from "./LogoCarro";

const QUICK = [
  { label: " Admin", email: "admin@autosport.com", password: "admin123" },
  { label: " Bodeguero", email: "bodega@autosport.com", password: "bodega123" },
];

function CarBg() {
  return (
    <svg
      className="login__bg-svg"
      viewBox="0 0 1200 400"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice">
      {/* Líneas de carretera */}
      <line
        x1="0"
        y1="300"
        x2="1200"
        y2="300"
        stroke="#F97316"
        strokeWidth="1"
        strokeOpacity="0.15"
      />
      <line
        x1="0"
        y1="320"
        x2="1200"
        y2="320"
        stroke="#F97316"
        strokeWidth="0.5"
        strokeOpacity="0.08"
      />
      {/* Líneas de carril animadas */}
      <g className="road-lines">
        <rect
          x="0"
          y="308"
          width="80"
          height="3"
          fill="#ffffff"
          fillOpacity="0.08"
          rx="2"
        />
        <rect
          x="160"
          y="308"
          width="80"
          height="3"
          fill="#ffffff"
          fillOpacity="0.08"
          rx="2"
        />
        <rect
          x="320"
          y="308"
          width="80"
          height="3"
          fill="#ffffff"
          fillOpacity="0.08"
          rx="2"
        />
        <rect
          x="480"
          y="308"
          width="80"
          height="3"
          fill="#ffffff"
          fillOpacity="0.08"
          rx="2"
        />
        <rect
          x="640"
          y="308"
          width="80"
          height="3"
          fill="#ffffff"
          fillOpacity="0.08"
          rx="2"
        />
        <rect
          x="800"
          y="308"
          width="80"
          height="3"
          fill="#ffffff"
          fillOpacity="0.08"
          rx="2"
        />
        <rect
          x="960"
          y="308"
          width="80"
          height="3"
          fill="#ffffff"
          fillOpacity="0.08"
          rx="2"
        />
        <rect
          x="1120"
          y="308"
          width="80"
          height="3"
          fill="#ffffff"
          fillOpacity="0.08"
          rx="2"
        />
      </g>
      {/* Carro 1 — grande, naranja */}
      <g className="car-1">
        <path
          d="M20,280 L50,260 L130,256 L160,260 L170,280 Z"
          fill="#F97316"
          fillOpacity="0.25"
        />
        <path
          d="M55,262 L80,252 L120,252 L140,262 Z"
          fill="#F97316"
          fillOpacity="0.35"
        />
        <circle
          cx="55"
          cy="282"
          r="10"
          fill="#1a1a1a"
          stroke="#F97316"
          strokeWidth="2"
          strokeOpacity="0.4"
        />
        <circle
          cx="145"
          cy="282"
          r="10"
          fill="#1a1a1a"
          stroke="#F97316"
          strokeWidth="2"
          strokeOpacity="0.4"
        />
        <line
          x1="0"
          y1="274"
          x2="22"
          y2="274"
          stroke="#F97316"
          strokeWidth="3"
          strokeOpacity="0.6"
        />
      </g>
      {/* Carro 2 — pequeño, más rápido */}
      <g className="car-2">
        <path
          d="M900,285 L920,272 L980,270 L1000,272 L1010,285 Z"
          fill="#F97316"
          fillOpacity="0.15"
        />
        <path
          d="M924,274 L940,266 L972,266 L988,274 Z"
          fill="#F97316"
          fillOpacity="0.2"
        />
        <circle
          cx="924"
          cy="287"
          r="8"
          fill="#1a1a1a"
          stroke="#F97316"
          strokeWidth="1.5"
          strokeOpacity="0.3"
        />
        <circle
          cx="990"
          cy="287"
          r="8"
          fill="#1a1a1a"
          stroke="#F97316"
          strokeWidth="1.5"
          strokeOpacity="0.3"
        />
        <line
          x1="878"
          y1="280"
          x2="902"
          y2="280"
          stroke="#F97316"
          strokeWidth="2"
          strokeOpacity="0.4"
        />
      </g>
      {/* Líneas de velocidad */}
      <g className="speed-lines">
        <line
          x1="0"
          y1="268"
          x2="60"
          y2="268"
          stroke="#F97316"
          strokeWidth="1"
          strokeOpacity="0.2"
        />
        <line
          x1="0"
          y1="272"
          x2="40"
          y2="272"
          stroke="#F97316"
          strokeWidth="0.5"
          strokeOpacity="0.15"
        />
        <line
          x1="0"
          y1="276"
          x2="50"
          y2="276"
          stroke="#F97316"
          strokeWidth="0.5"
          strokeOpacity="0.1"
        />
      </g>
      {/* Puntos de luz lejanos */}
      <circle cx="1100" cy="250" r="2" fill="#F97316" fillOpacity="0.3" />
      <circle cx="1140" cy="255" r="1.5" fill="#F97316" fillOpacity="0.2" />
      <circle cx="200" cy="240" r="1" fill="#ffffff" fillOpacity="0.15" />
      <circle cx="600" cy="230" r="1.5" fill="#ffffff" fillOpacity="0.1" />
    </svg>
  );
}

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
      await login(emailToAuth, passwordToAuth);
      const from = location.state?.from || "/dashboard";
      navigate(from);
    } catch (err) {
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
      <CarBg />

      <div className="login__card">
        <button className="login__theme" onClick={toggleTheme} type="button">
          {theme === "dark" ? "☀ Modo Claro" : "🌙 Modo Oscuro"}
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

        <div className="login__quick">
          <p className="login__quick-label">Acceso rápido</p>
          <div className="login__quick-btns">
            {QUICK.map((q) => (
              <button
                key={q.label}
                type="button"
                className="login__quick-btn"
                onClick={(e) => handleSubmit(e, q.email, q.password)}
                disabled={loading || bloqueado}>
                {q.label}
              </button>
            ))}
          </div>
        </div>

        <div className="login__divider">
          <span>o ingresa manualmente</span>
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
