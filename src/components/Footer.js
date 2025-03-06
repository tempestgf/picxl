"use client";

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-6 text-center">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <img
              src="/logo.svg"
              alt="Logo"
              className="h-6 w-auto dark:invert transition duration-300"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-red-500">PICXL</span> - Procesamiento de tickets
            </p>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} - <span className="font-medium">Tomecanic Hispania, SA</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
