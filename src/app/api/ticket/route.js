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

export async function GET(request) {
  try {
    const decoded = await authenticate(request);
    const userId = decoded.id;
    const tickets = await prisma.ticket.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return new Response(JSON.stringify({ tickets }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Error interno" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function POST(request) {
  try {
    const decoded = await authenticate(request);
    const userId = decoded.id;
    // Verificar que el usuario exista
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Usuario no encontrado" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Se espera recibir imageName o, en su defecto, imageUrl y opcionalmente ticketType
    const {
      merchantName,
      dateTime,
      total,
      imageName,
      imageUrl: providedImageUrl,
      ticketType,
    } = await request.json();
    // Si no se recibe imageName, se intenta extraer el nombre de archivo desde imageUrl
    const finalImageName = imageName || (providedImageUrl ? providedImageUrl.split('/').pop() : null);
    if (!merchantName || !dateTime || !total || !finalImageName) {
      return new Response(
        JSON.stringify({ error: "Faltan datos del ticket" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Se espera que dateTime venga en formato "dd-MM-yy hh:mm"
    const [datePart, timePart] = dateTime.split(" ");
    const [day, month, year] = datePart.split("-");
    const formattedDate = new Date(
      `20${year}`,
      Number(month) - 1,
      Number(day),
      ...timePart.split(":")
    );

    // Define el dominio completo (usa process.env.DOMAIN si está definido)
    const DOMAIN = process.env.DOMAIN || "http://tomecanic.hopto.org:8080";
    // Construir la URL absoluta de la imagen usando el nombre final
    const finalImageUrl = `${DOMAIN}/api/image/${finalImageName}`;
    // Si no se envía ticketType, se usará "individual" por defecto
    const finalTicketType = ticketType || "individual";

    const ticket = await prisma.ticket.create({
      data: {
        merchantName,
        dateTime: formattedDate,
        total: parseFloat(total.replace("€", "")),
        imageUrl: finalImageUrl,
        ticketType: finalTicketType,
        user: { connect: { id: userId } },
      },
    });
    return new Response(
      JSON.stringify({ message: "Ticket guardado", ticket }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Error interno" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
