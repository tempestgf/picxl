"use client";

import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/me", {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setUser({ username: data.username, isAdmin: data.isAdmin });
      }
    } catch (error) {
      console.error("Error comprobando autenticación:", error);
    }
    setLoading(false);
    // Add a small delay to show the app with a nice transition
    setTimeout(() => setAppReady(true), 300);
  };

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        setUser(null);
      } else {
        console.error("Error al cerrar sesión");
      }
    } catch (error) {
      console.error("Error en logout:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return {
    user,
    setUser,
    loading,
    appReady,
    handleSignOut,
  };
}
