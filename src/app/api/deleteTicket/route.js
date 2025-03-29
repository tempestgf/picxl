import jwt from "jsonwebtoken";
import prisma from '../../../../lib/prisma';

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

export async function DELETE(request) {
  try {
    // Authenticate the user
    const decoded = await authenticate(request);
    const userId = decoded.id;
    
    // Get the ticket ID from the URL
    const url = new URL(request.url);
    const ticketId = parseInt(url.searchParams.get("id"));
    
    if (!ticketId) {
      return new Response(
        JSON.stringify({ error: "ID de ticket no proporcionado" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    // Check if the ticket exists and belongs to the user
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { id: true, userId: true }
    });
    
    if (!ticket) {
      return new Response(
        JSON.stringify({ error: "Ticket no encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    if (ticket.userId !== userId) {
      return new Response(
        JSON.stringify({ error: "No estás autorizado para eliminar este ticket" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    // Delete the ticket
    await prisma.ticket.delete({
      where: { id: ticketId }
    });
    
    return new Response(
      JSON.stringify({ message: "Ticket eliminado correctamente" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error al eliminar ticket:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error interno" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    // Clean up the connection only in production
    if (process.env.NODE_ENV === 'production') {
      await prisma.$disconnect();
    }
  }
}
