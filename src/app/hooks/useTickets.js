"use client";

import { useState, useEffect } from "react";

export function useTickets(user) {
  const [tickets, setTickets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchTickets = async () => {
    if (!user) return;
    
    try {
      setRefreshing(true);
      const res = await fetch("/api/ticket", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setTickets(data.tickets);
      } else {
        console.error("Error obteniendo tickets:", data.error);
      }
    } catch (error) {
      console.error("Error al obtener tickets:", error);
    } finally {
      setTimeout(() => setRefreshing(false), 500); // Add small delay for animation
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      const res = await fetch("/api/deleteTicket", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Error eliminando ticket");
      }
      fetchTickets();
    } catch (error) {
      console.error("Error al eliminar ticket:", error);
      alert("Error al eliminar ticket.");
    }
  };

  // Calculate stats for tickets
  const getTicketStats = () => ({
    total: tickets.length,
    individual: tickets.filter(t => t.ticketType === 'individual').length,
    collective: tickets.filter(t => t.ticketType === 'colectivo').length,
    totalAmount: tickets.reduce((sum, t) => {
      let amount = 0;
      if (t.total) {
        if (typeof t.total === 'string') {
          amount = parseFloat(t.total.replace(/[€$,]/g, '')) || 0;
        } else if (typeof t.total === 'number') {
          amount = t.total;
        }
      }
      return sum + amount;
    }, 0).toFixed(2)
  });

  useEffect(() => {
    if (user) fetchTickets();
  }, [user]);

  return {
    tickets,
    refreshing,
    selectedImage,
    setSelectedImage,
    fetchTickets,
    handleDeleteTicket,
    getTicketStats
  };
}
