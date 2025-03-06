import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
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

export async function GET(request) {
  try {
    const decoded = await authenticate(request);
    const userId = decoded.id;
    const tickets = await prisma.ticket.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Se añade la columna "Tipo" al encabezado
    const headers = ["ID", "Nombre empresa", "Fecha", "Importe total", "Enlace imagen", "Tipo"];
    const data = tickets.map((ticket) => {
      const dt = new Date(ticket.dateTime);
      const formattedDate = `${dt.getDate()}-${dt.getMonth() + 1}-${dt.getFullYear()} ${dt.getHours()}:${dt.getMinutes()}`;
      return [
        ticket.id,
        ticket.merchantName,
        formattedDate,
        `${ticket.total.toFixed(2)}€`,
        ticket.imageUrl,
        ticket.ticketType || "individual",
      ];
    });

    const rows = [headers, ...data];
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");

    const workbookBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    return new Response(workbookBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="tickets.xlsx"`,
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message || "Error interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
