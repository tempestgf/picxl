// src/app/api/deleteTicket/route.js
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const SECRET_KEY = "mi_clave_secreta";

async function authenticate(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookiesObj = Object.fromEntries(
    cookieHeader.split("; ").map((cookie) => {
      const [name, ...rest] = cookie.split("=");
      return [name, rest.join("=")];
    })
  );
  const token = cookiesObj.token;
  if (!token) throw new Error("No autenticado");
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    throw new Error("Token inválido");
  }
}

export async function POST(request) {
  try {
    const decoded = await authenticate(request);
    const userId = decoded.id;
    const { ticketId } = await request.json();
    if (!ticketId) {
      return new Response(JSON.stringify({ error: "Falta el id del ticket" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    // Verificar que el ticket pertenezca al usuario
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket || ticket.userId !== userId) {
      return new Response(JSON.stringify({ error: "Ticket no encontrado o no autorizado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    await prisma.ticket.delete({ where: { id: ticketId } });
    return new Response(JSON.stringify({ message: "Ticket eliminado correctamente" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Error interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
