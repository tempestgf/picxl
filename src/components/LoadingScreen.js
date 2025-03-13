"use client";

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-red-700 to-red-500 dark:from-red-900 dark:to-red-700 text-white">
      <div className="relative">
        <div className="w-80 h-80 border-t-4 border-b-4 border-white rounded-full animate-spin-slow shadow-lg"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/logo.gif"
            alt="Logo"
            className="w-70 h-70 animate-pulse-slow drop-shadow-xl"
          />
        </div>
      </div>
      <p className="mt-12 text-xl font-semibold tracking-wider animate-pulse">Iniciando PICXL...</p>
    </div>
  );
}
