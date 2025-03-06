import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Providers from "./providers";
import { UserProvider } from '../contexts/UserContext';
import { ThemeProvider } from '../contexts/ThemeContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'PICXL - Reconocimiento de Texto',
  description: 'Procesador de imágenes y reconocimiento de texto con IA',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning className="transition-colors">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors`}>
        <Script src="https://accounts.google.com/gsi/client" strategy="beforeInteractive" />
        <ThemeProvider>
          <UserProvider>
            <Providers>
              {children}
            </Providers>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
