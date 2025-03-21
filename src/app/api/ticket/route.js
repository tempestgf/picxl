import jwt from "jsonwebtoken";
import { createClient } from '@supabase/supabase-js';
import prisma from '../../../../lib/prisma';

const SECRET_KEY = "mi_clave_secreta";

// Inicializar el cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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
    
    // Add error checking for prisma
    if (!prisma) {
      console.error("Prisma client is undefined");
      return new Response(
        JSON.stringify({ error: "Database connection error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    const tickets = await prisma.ticket.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    
    return new Response(JSON.stringify({ tickets }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in GET /api/ticket:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error interno" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    // Limpieza explícita sólo cuando estamos en producción
    if (process.env.NODE_ENV === 'production') {
      await prisma.$disconnect();
    }
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
    if (!merchantName || !dateTime || !total || (!finalImageName && !providedImageUrl)) {
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

    // Usar la URL completa si se proporcionó, o construir una con la URL pública de Supabase
    let finalImageUrl;
    
    if (providedImageUrl) {
      // Si ya tenemos una URL completa, la usamos directamente
      finalImageUrl = providedImageUrl;
    } else if (finalImageName) {
      // Si tenemos un nombre pero no URL, obtenemos la URL pública de Supabase
      const { data } = supabase
        .storage
        .from('images')
        .getPublicUrl(`uploads/${finalImageName}`);
      
      finalImageUrl = data.publicUrl;
    }
    
    // Si no se envía ticketType, se usará "individual" por defecto
    const finalTicketType = ticketType || "individual";

    const ticket = await prisma.ticket.create({
      data: {
        merchantName,
        dateTime: formattedDate,
        total: parseFloat(total.toString().replace("€", "")),
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
    console.error("Error al guardar ticket:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Error interno" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  } finally {
    // Limpieza explícita sólo cuando estamos en producción
    if (process.env.NODE_ENV === 'production') {
      await prisma.$disconnect();
    }
  }
}