// src/app/components/TicketViewer.js
"use client";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  FaTicketAlt,
  FaSearch,
  FaFileExcel,
  FaTrash,
  FaSync,
  FaSyncAlt,
  FaCalendarAlt,
  FaLink,
  FaEye,
  FaGoogle,
  FaFilter,
  FaEuroSign,
  FaBuilding,
  FaFileInvoice,
} from "react-icons/fa";

export default function TicketViewer({
  tickets,
  excelLink,
  onImageClick,
  onDeleteTicket = () => {},
  isAdmin = null,
  folderId = "ID_DE_TU_CARPETA_EN_DRIVE", // Reemplaza con tu Folder ID real
}) {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(""); // Formato: "YYYY-MM-DD"
  const [endDate, setEndDate] = useState("");     // Formato: "YYYY-MM-DD"
  const [downloading, setDownloading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [googleToken, setGoogleToken] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userName, setUserName] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [hoverTicketId, setHoverTicketId] = useState(null);

  // Función para formatear la fecha como "d-m-yyyy hh:mm"
  function formatDate(dateValue) {
    const dt = new Date(dateValue);
    if (isNaN(dt.getTime())) return "";
    const day = dt.getDate();
    const month = dt.getMonth() + 1;
    const year = dt.getFullYear();
    const hours = dt.getHours();
    const minutes = dt.getMinutes();
    return `${day}-${month}-${year} ${hours}:${minutes < 10 ? "0" + minutes : minutes}`;
  }

  // Consulta /api/me para obtener el usuario (username y googleAccessToken)
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const user = await res.json();
          if (user.username) setUserName(user.username);
          if (user.isAdmin && user.googleAccessToken)
            setGoogleToken(user.googleAccessToken);
        }
      } catch (error) {
        console.error("Error obteniendo info de usuario:", error);
      } finally {
        setLoadingUser(false);
      }
    }
    fetchUser();
  }, []);

  // Filtro de tickets basado en búsqueda y rango de fechas
  const filteredTickets = tickets
    .filter((ticket) =>
      Object.values(ticket)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter((ticket) => {
      if (!startDate && !endDate) return true;
      const ticketDate = new Date(ticket.dateTime);
      if (isNaN(ticketDate.getTime())) return false;
      if (startDate) {
        const start = new Date(startDate);
        if (ticketDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (ticketDate > end) return false;
      }
      return true;
    });

  const totalAmount = filteredTickets
    .reduce((sum, ticket) => sum + (Number(ticket.total) || 0), 0)
    .toFixed(2);

  // Función para generar el Excel a partir de los tickets y convertirlo a base64.
  const generateExcelBase64 = () => {
    // Se añade la columna "Tipo"
    const headers = ["ID", "Nombre empresa", "Fecha", "Importe total", "Enlace imagen", "Tipo"];
    const data = filteredTickets.map((ticket) => {
      const dt = new Date(ticket.dateTime);
      let formattedDate = "";
      if (!isNaN(dt.getTime())) {
        formattedDate = `${dt.getDate()}-${dt.getMonth() + 1}-${dt.getFullYear()} ${dt.getHours()}:${dt.getMinutes() < 10 ? "0" + dt.getMinutes() : dt.getMinutes()}`;
      }
      const formattedTotal = Number(ticket.total).toFixed(2) + "€";
      return [
        String(ticket.id),
        ticket.merchantName || "",
        formattedDate,
        formattedTotal,
        ticket.imageUrl ? `${ticket.imageUrl}?t=${new Date().getTime()}` : "",
        ticket.ticketType || "individual",
      ];
    });
    const rows = [headers, ...data];
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(rows);

    // Forzar que la columna "Importe total" (columna D, índice 3) se trate como texto:
    const range = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      const cellAddress = { c: 3, r: R };
      const cellRef = XLSX.utils.encode_cell(cellAddress);
      if (worksheet[cellRef]) {
        worksheet[cellRef].t = "s";
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");
    return XLSX.write(workbook, { bookType: "xlsx", type: "base64" });
  };

  // Función para solicitar un token nuevo mediante Google Identity Services
  const handleGoogleLink = async () => {
    if (window.google && window.google.accounts) {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id:
          "298066462115-joh8voarb29tkbt9g9lsejocp4nm72vo.apps.googleusercontent.com",
        scope: "https://www.googleapis.com/auth/drive.file",
        callback: (response) => {
          if (response.error) {
            alert("Error obteniendo token: " + response.error);
          } else {
            console.log("Nuevo token obtenido:", response.access_token);
            setGoogleToken(response.access_token);
            saveGoogleToken(response.access_token);
          }
        },
      });
      tokenClient.requestAccessToken();
    } else {
      alert("La librería de Google Identity Services no se cargó correctamente.");
    }
  };

  // Función para guardar el token en el backend
  const saveGoogleToken = async (accessToken) => {
    try {
      console.log("Enviando token para el usuario:", userName, accessToken);
      const res = await fetch("/api/save-google-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userName, accessToken }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error("Error al guardar el token: " + errorText);
      }
      alert("Cuenta de Google vinculada correctamente");
    } catch (error) {
      console.error("Error guardando token:", error);
      alert("No se pudo guardar el token de Google");
    }
  };

  // Función para descargar el Excel llamando al endpoint /api/exportExcel
  const handleDownloadExcel = async () => {
    try {
      setDownloading(true);
      const res = await fetch("/api/exportExcel", { method: "GET", credentials: "include" });
      if (!res.ok) throw new Error("No se pudo descargar el Excel");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "tickets.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar Excel:", error);
      alert("Ocurrió un error al descargar el Excel.");
    } finally {
      setDownloading(false);
    }
  };

  // Función para actualizar el Excel en Drive
  const handleUpdateDrive = async () => {
    if (!googleToken) {
      await handleGoogleLink();
      return;
    }
    try {
      setUpdating(true);
      const base64Excel = generateExcelBase64();
      const payload = {
        base64Excel,
        fileName: "resultado_recibo.xlsx",
        token: googleToken,
      };
      let res = await fetch("/api/update-excel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error en update-excel:", errorText);
        if (errorText.includes("Invalid Credentials")) {
          alert("El token ha expirado o es inválido. Solicitando uno nuevo...");
          await handleGoogleLink();
          return handleUpdateDrive();
        }
        throw new Error("Error al actualizar Excel: " + errorText);
      }
      const data = await res.json();
      alert("Excel actualizado en Drive. Link: " + data.webViewLink);
    } catch (error) {
      console.error("Error al actualizar en Drive:", error);
      alert("Ocurrió un error al actualizar en Drive: " + error.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white dark:bg-gray-900 p-6 sm:p-10 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 animate-fade-in space-y-8 relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      {/* Decorative elements with enhanced dark mode support */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-red-50 dark:bg-red-950/40 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl opacity-40 z-0"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-50 dark:bg-blue-950/40 rounded-full translate-y-1/4 -translate-x-1/4 blur-3xl opacity-30 z-0"></div>
      <div className="absolute left-1/2 top-1/4 w-24 h-24 bg-green-50 dark:bg-green-950/40 rounded-full transform -translate-x-1/2 blur-3xl opacity-20 z-0"></div>
      
      {/* Header with professional styling - no tilted icon */}
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-red-500 to-red-700 dark:from-red-600 dark:to-red-800 p-3.5 rounded-xl shadow-lg transition-transform duration-300">
              <FaTicketAlt className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center">
                Visor de <span className="ml-2 text-red-600 dark:text-red-400">Tickets</span>
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5 max-w-sm">
                Gestiona tus tickets digitalizados con facilidad
              </p>
            </div>
          </div>
          
          {/* Counter badges with proper dark mode styling */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-5 py-2.5 rounded-full text-gray-700 dark:text-gray-200 shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-1.5 animate-float">
              <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/60 flex items-center justify-center">
                <FaTicketAlt className="text-red-500 dark:text-red-400 text-xs" />
              </div>
              <span className="font-semibold">
                {filteredTickets.length}
              </span> tickets
            </div>
            <div className="text-sm bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-5 py-2.5 rounded-full text-green-800 dark:text-green-300 shadow-sm border border-green-100 dark:border-green-900 flex items-center gap-1.5 animate-pulse-soft">
              <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/60 flex items-center justify-center">
                <FaEuroSign className="text-green-600 dark:text-green-400 text-xs" />
              </div>
              <span className="font-semibold">
                {totalAmount}€
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters with elegant dark mode styling */}
      <div className="relative z-10 flex flex-col space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaSearch className="text-gray-500 dark:text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por ID, empresa, fecha o importe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-3.5 pl-11 pr-4 text-base text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
            aria-label="Buscar tickets"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Limpiar búsqueda"
            >
              &times;
            </button>
          )}
        </div>
        
        {/* Filter toggle with improved styling */}
        <div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 py-2 px-4 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
            aria-expanded={showFilters}
            aria-controls="filter-panel"
          >
            <div className="relative">
              <FaFilter className={`transition-transform duration-300 ${showFilters ? 'rotate-180 text-red-500' : ''}`} />
              {filteredTickets.length !== tickets.length && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </div>
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </button>
          
          {/* Filter panel with proper dark mode styling */}
          {showFilters && (
            <div id="filter-panel" className="mt-4 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md animate-fade-in space-y-6">
              <h3 className="text-md font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b border-gray-200 dark:border-gray-700 pb-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/60 flex items-center justify-center">
                  <FaCalendarAlt className="text-red-600 dark:text-red-400 text-xs" />
                </div>
                Filtrar por fecha
              </h3>
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex flex-col w-full sm:w-auto">
                  <label htmlFor="startDate" className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span> Desde
                  </label>
                  <div className="relative">
                    <input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="py-3 px-4 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md pl-10"
                    />
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500 dark:text-red-400" />
                  </div>
                </div>
                <div className="flex flex-col w-full sm:w-auto">
                  <label htmlFor="endDate" className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500"></span> Hasta
                  </label>
                  <div className="relative">
                    <input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="py-3 px-4 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md pl-10"
                    />
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-500 dark:text-red-400" />
                  </div>
                </div>
                
                {/* Reset filters button */}
                {(startDate || endDate) && (
                  <div className="flex items-end mb-1 mt-auto">
                    <button
                      onClick={() => {setStartDate(''); setEndDate('');}}
                      className="flex items-center gap-2 py-2 px-4 text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 dark:border-red-900 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <FaSyncAlt className="w-3.5 h-3.5" />
                      Limpiar fechas
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Google Link Button */}
      {isAdmin && !googleToken && !loadingUser && (
        <div className="relative z-10">
          <button
            onClick={handleGoogleLink}
            className="group w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all duration-300 ease-in-out text-white px-8 py-3.5 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:scale-105 relative overflow-hidden"
            aria-label="Vincular cuenta de Google"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-300 to-blue-600 opacity-0 group-hover:opacity-20 transform translate-x-full group-hover:translate-x-0 transition-all duration-500"></span>
            <FaGoogle className="text-white relative z-10" />
            <span className="relative z-10">Vincular cuenta de Google</span>
          </button>
        </div>
      )}

      {/* Mensaje si no hay tickets with enhanced style */}
      {filteredTickets.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <div className="absolute -inset-4 flex justify-center items-center">
              {[...Array(20)].map((_, i) => (
                <FaTicketAlt 
                  key={i} 
                  className="text-gray-400 dark:text-gray-500 absolute" 
                  style={{
                    fontSize: `${Math.random() * 2 + 1}rem`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    opacity: Math.random() * 0.8,
                    transform: `rotate(${Math.random() * 360}deg)`
                  }}
                />
              ))}
            </div>
          </div>
          <div className="relative z-10">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full mx-auto h-24 w-24 flex items-center justify-center mb-5 shadow-inner border-4 border-white dark:border-gray-600">
              <FaTicketAlt className="w-10 h-10 text-gray-400 dark:text-gray-400 animate-pulse" />
            </div>
            <p className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">
              No hay tickets que coincidan
            </p>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-md mx-auto">
              Intenta con otros criterios de búsqueda o ajusta los filtros de fecha.
            </p>
            {startDate || endDate || search ? (
              <button 
                onClick={() => {setStartDate(''); setEndDate(''); setSearch('');}}
                className="mt-6 inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium border border-red-200 dark:border-red-800 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <FaSyncAlt className="w-4 h-4" />
                Restablecer filtros
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          {/* Ticket list with proper dark mode */}
          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="max-h-[60vh] overflow-y-auto rounded-lg bg-white dark:bg-gray-800">
              {/* Mobile view for tickets */}
              <div className="block sm:hidden space-y-4 p-4">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-600 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                          <span className="font-bold text-red-600 dark:text-red-300">#{ticket.id}</span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 block">Ticket ID</span>
                          <span className="font-bold text-lg text-gray-800 dark:text-gray-100">
                            #{ticket.id}
                          </span>
                        </div>
                      </div>
                      
                      <div className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 shadow-sm">
                        <FaTicketAlt className="text-xs text-gray-600 dark:text-gray-400 mr-1" />
                        {ticket.ticketType || "individual"}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 mb-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Empresa</span>
                        <div className="flex items-center gap-2">
                          <FaBuilding className="text-red-600 dark:text-red-400" />
                          <span className="font-medium text-gray-800 dark:text-gray-200 text-base">
                            {ticket.merchantName || "N/A"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Fecha</span>
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-red-600 dark:text-red-400" />
                          <span className="font-medium text-gray-800 dark:text-gray-200 text-base">
                            {ticket.dateTime ? formatDate(ticket.dateTime) : "N/A"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 dark:bg-green-900 rounded-lg p-3 shadow-sm">
                        <span className="text-xs text-green-800 dark:text-green-300 block mb-1">Total</span>
                        <div className="flex items-center gap-2">
                          <FaEuroSign className="text-green-600 dark:text-green-300" />
                          <span className="font-bold text-lg text-green-700 dark:text-green-300">{ticket.total} €</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => onImageClick(`${ticket.imageUrl}?t=${new Date().getTime()}`)}
                        className="flex-1 flex items-center justify-center gap-2 text-white bg-red-600 hover:bg-red-700 transition-colors font-medium py-2.5 px-4 rounded-lg shadow-sm hover:shadow"
                        aria-label={`Ver imagen del ticket ${ticket.id}`}
                      >
                        <FaEye />
                        Ver Imagen
                      </button>
                      <button
                        onClick={() => onDeleteTicket(ticket.id)}
                        className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-white hover:bg-red-600 transition-colors rounded-lg border border-gray-300 dark:border-gray-600"
                        aria-label={`Eliminar ticket ${ticket.id}`}
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table view with enhanced dark mode */}
              <div className="hidden sm:block">
                <table className="min-w-full text-base">
                  <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th scope="col" className="py-4 px-4 font-semibold text-left text-gray-800 dark:text-gray-200 tracking-wider border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <FaFileInvoice className="text-red-600 dark:text-red-400" />
                          ID
                        </div>
                      </th>
                      <th scope="col" className="py-4 px-4 font-semibold text-left text-gray-800 dark:text-gray-200 tracking-wider border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <FaBuilding className="text-red-600 dark:text-red-400" />
                          Empresa
                        </div>
                      </th>
                      <th scope="col" className="py-4 px-4 font-semibold text-left text-gray-800 dark:text-gray-200 tracking-wider border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-red-600 dark:text-red-400" />
                          Fecha
                        </div>
                      </th>
                      <th scope="col" className="py-4 px-4 font-semibold text-left text-gray-800 dark:text-gray-200 tracking-wider border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <FaEuroSign className="text-red-600 dark:text-red-400" />
                          Total
                        </div>
                      </th>
                      <th scope="col" className="py-4 px-4 font-semibold text-left text-gray-800 dark:text-gray-200 tracking-wider border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <FaLink className="text-red-600 dark:text-red-400" />
                          Imagen
                        </div>
                      </th>
                      <th scope="col" className="py-4 px-4 font-semibold text-left text-gray-800 dark:text-gray-200 tracking-wider border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <FaTicketAlt className="text-red-600 dark:text-red-400" />
                          Tipo
                        </div>
                      </th>
                      <th scope="col" className="py-4 px-4 font-semibold text-left text-gray-800 dark:text-gray-200 tracking-wider border-b border-gray-200 dark:border-gray-700">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredTickets.map((ticket, index) => (
                      <tr
                        key={ticket.id}
                        className={`${
                          index % 2 === 0 
                            ? "bg-white dark:bg-gray-800" 
                            : "bg-gray-50 dark:bg-gray-900"
                        } hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors`}
                      >
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center shadow-sm">
                              <span className="font-medium text-red-600 dark:text-red-300">#{ticket.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FaBuilding className="text-gray-600 dark:text-gray-400" />
                            <span className="text-gray-900 dark:text-gray-200">{ticket.merchantName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-gray-600 dark:text-gray-400" />
                            <span className="text-gray-900 dark:text-gray-200">
                              {ticket.dateTime ? formatDate(ticket.dateTime) : ""}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FaEuroSign className="text-green-600 dark:text-green-400" />
                            <span className="font-medium text-green-700 dark:text-green-300">
                              {ticket.total} €
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <button
                            onClick={() =>
                              onImageClick(`${ticket.imageUrl}?t=${new Date().getTime()}`)
                            }
                            className="inline-flex items-center gap-2 text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors font-medium"
                            aria-label={`Ver imagen del ticket ${ticket.id}`}
                          >
                            <FaEye />
                            Ver Imagen
                          </button>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="px-3 py-1.5 rounded-full bg-gray-200 dark:bg-gray-600 text-sm font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1">
                              <FaTicketAlt className="text-gray-600 dark:text-gray-400 mr-1" />
                              {ticket.ticketType || "individual"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 whitespace-nowrap">
                          <button
                            onClick={() => onDeleteTicket(ticket.id)}
                            className="inline-flex items-center gap-2 text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors"
                            aria-label={`Eliminar ticket ${ticket.id}`}
                          >
                            <FaTrash className="w-4 h-4" />
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Professional total and action section */}
      <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 p-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-200 dark:border-gray-700 rounded-b-xl shadow-lg z-20">
        {/* Total box with gradient and proper dark mode */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/40 px-6 py-3 rounded-lg shadow-sm flex items-center gap-3">
          <div className="flex flex-col">
            <p className="text-sm text-green-800 dark:text-green-300">Total:</p>
            <p className="text-2xl font-bold text-green-700 dark:text-green-200">{totalAmount}€</p>
          </div>
          <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-gray-900 shadow-inner">
            <FaEuroSign className="text-green-500 dark:text-green-400 text-xl" />
          </div>
        </div>
        
        {/* Action buttons with proper gradients */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={handleDownloadExcel}
            disabled={downloading}
            className="group relative w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all text-white px-6 py-3.5 rounded-lg font-medium shadow hover:shadow-lg overflow-hidden"
            aria-label="Descargar Excel"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-300 to-red-600 opacity-0 group-hover:opacity-20 transform translate-x-full group-hover:translate-x-0 transition-all duration-500"></span>
            {downloading ? (
              <>
                <FaSync className="w-5 h-5 animate-spin relative z-10" />
                <span className="relative z-10">Descargando Excel...</span>
              </>
            ) : (
              <>
                <FaFileExcel className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Descargar Excel</span>
              </>
            )}
          </button>
          {isAdmin && (
            <button
              onClick={handleUpdateDrive}
              disabled={updating}
              className="group relative w-full sm:w-auto flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all text-white px-6 py-3.5 rounded-lg font-medium shadow hover:shadow-lg overflow-hidden"
              aria-label="Actualizar en Drive"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-red-300 to-red-600 opacity-0 group-hover:opacity-20 transform translate-x-full group-hover:translate-x-0 transition-all duration-500"></span>
              {updating ? (
                <>
                  <FaSyncAlt className="w-5 h-5 animate-spin relative z-10" />
                  <span className="relative z-10">Actualizando Drive...</span>
                </>
              ) : (
                <>
                  <FaSyncAlt className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Actualizar en Drive</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
