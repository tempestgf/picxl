'use client';

import { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch user data including isAdmin status
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

  return (
    <UserContext.Provider value={{ user, setUser, loading, handleSignOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
