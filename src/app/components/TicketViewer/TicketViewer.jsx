"use client";
import { useState, useEffect } from "react";
import { Header } from "./Header";
import { SearchAndFilters } from "./SearchAndFilters";
import { GoogleLinkButton } from "./GoogleLinkButton";
import { NoTicketsMessage } from "./NoTicketsMessage";
import { TicketList } from "./TicketList";
import { TotalAndActions } from "./TotalAndActions";
import { generateExcelBase64 } from "./utils/excelUtils";

export default function TicketViewer({
  tickets,
  excelLink,
  onImageClick,
  onDeleteTicket = () => {},
  isAdmin = null,
  folderId = "ID_DE_TU_CARPETA_EN_DRIVE",
}) {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [googleToken, setGoogleToken] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userName, setUserName] = useState("");
  const [showFilters, setShowFilters] = useState(false);

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

  const filteredTickets = tickets
    .filter((ticket) =>
      Object.values(ticket).join(" ").toLowerCase().includes(search.toLowerCase())
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

  const handleUpdateDrive = async () => {
    if (!googleToken) {
      await handleGoogleLink();
      return;
    }
    try {
      setUpdating(true);
      const base64Excel = generateExcelBase64(filteredTickets);
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
      <Header ticketsCount={filteredTickets.length} totalAmount={totalAmount} />
      <SearchAndFilters
        search={search}
        setSearch={setSearch}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />
      <GoogleLinkButton
        isAdmin={isAdmin}
        googleToken={googleToken}
        loadingUser={loadingUser}
        userName={userName}
        setGoogleToken={setGoogleToken}
      />
      {filteredTickets.length === 0 ? (
        <NoTicketsMessage
          startDate={startDate}
          endDate={endDate}
          search={search}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          setSearch={setSearch}
        />
      ) : (
        <TicketList
          filteredTickets={filteredTickets}
          onImageClick={onImageClick}
          onDeleteTicket={onDeleteTicket}
        />
      )}
      <TotalAndActions
        totalAmount={totalAmount}
        downloading={downloading}
        updating={updating}
        isAdmin={isAdmin}
        handleDownloadExcel={handleDownloadExcel}
        handleUpdateDrive={handleUpdateDrive}
      />
    </div>
  );
}
