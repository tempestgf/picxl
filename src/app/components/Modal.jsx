"use client";
import { useEffect } from "react";
import { FiX } from "react-icons/fi";

export default function Modal({ imageUrl, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
    >
      <div
        className="relative transform transition-all duration-300 ease-in-out scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white text-2xl hover:text-gray-300 focus:outline-none"
        >
          <FiX />
        </button>
        <img
          src={imageUrl}
          alt="Imagen ampliada"
          className="max-w-full max-h-screen rounded-lg shadow-2xl object-contain"
        />
      </div>
    </div>
  );
}
