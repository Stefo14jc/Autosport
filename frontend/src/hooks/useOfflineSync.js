import { useEffect, useState } from "react";
import api from "../api/axiosClient";

const COLA_KEY = "offline_queue";

export function useOfflineSync() {
  const [online, setOnline] = useState(navigator.onLine);
  const [pendientes, setPendientes] = useState(
    JSON.parse(localStorage.getItem(COLA_KEY) || "[]").length,
  );

  useEffect(() => {
    const onOnline = async () => {
      setOnline(true);
      const cola = JSON.parse(localStorage.getItem(COLA_KEY) || "[]");
      if (cola.length === 0) return;

      const fallidos = [];
      for (const item of cola) {
        try {
          await api({
            method: item.method,
            url: item.url.replace(location.origin, ""),
            data: item.body,
          });
        } catch {
          fallidos.push(item);
        }
      }
      localStorage.setItem(COLA_KEY, JSON.stringify(fallidos));
      setPendientes(fallidos.length);
      if (fallidos.length === 0)
        alert(
          "Sincronización completada: todos los movimientos offline fueron enviados.",
        );
    };

    const onOffline = () => setOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return { online, pendientes };
}
