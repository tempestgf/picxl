"use client";
import { useState } from "react";

export default function AuthenticationForm({ onAuthSuccess, onSignOut }) {
  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [betaCode, setBetaCode] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = authMode === "login" ? "/api/login" : "/api/register";
    const payload = authMode === "login"
      ? { username, password }
      : { username, password, betaCode };

    const res = await fetch(endpoint, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      onAuthSuccess({ username: data.username });
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="animate-fadeIn glass-effect p-10 rounded-xl shadow-2xl max-w-md w-full mx-auto relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent animate-gradient"></div>
      <div className="relative z-10">
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent animate-float">
          {authMode === "login" ? "Inicia Sesión" : "Regístrate"}
        </h1>
        <form onSubmit={handleAuth} className="space-y-6">
          <div className="group">
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg 
                       focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 
                       transition-all duration-300 bg-white/80 dark:bg-gray-800/80 
                       text-gray-800 dark:text-gray-200 backdrop-blur-sm
                       group-hover:shadow-lg card-hover"
              required
            />
          </div>
          <div className="group">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg 
                       focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 
                       transition-all duration-300 bg-white/80 dark:bg-gray-800/80 
                       text-gray-800 dark:text-gray-200 backdrop-blur-sm
                       group-hover:shadow-lg card-hover"
              required
            />
          </div>
          {authMode === "register" && (
            <div className="group animate-slide-down">
              <input
                type="text"
                placeholder="Código beta"
                value={betaCode}
                onChange={(e) => setBetaCode(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg 
                         focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 
                         transition-all duration-300 bg-white/80 dark:bg-gray-800/80 
                         text-gray-800 dark:text-gray-200 backdrop-blur-sm
                         group-hover:shadow-lg card-hover"
                required
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 
                     text-white p-4 rounded-lg font-bold text-lg transform hover:scale-[1.02] 
                     transition-all duration-300 hover-pulse shadow-lg hover:shadow-red-500/25"
          >
            {authMode === "login" ? "Ingresar" : "Registrarse"}
          </button>
        </form>
        <p className="mt-6 text-center text-base sm:text-lg text-gray-600 dark:text-gray-300">
          {authMode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
            className="text-red-500 hover:text-red-700 font-bold hover:underline 
                     transition-all duration-300 relative hover:scale-105 inline-block"
          >
            {authMode === "login" ? "Regístrate" : "Inicia Sesión"}
          </button>
        </p>
        {onSignOut && (
          <div className="mt-8 text-center">
            <button
              onClick={onSignOut}
              className="text-red-500 hover:text-red-700 font-bold text-base sm:text-lg
                       hover:underline transition-all duration-300 relative 
                       hover:scale-105 inline-block"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
