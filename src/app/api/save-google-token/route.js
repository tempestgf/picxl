import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const data = await request.json();
    console.log("Datos recibidos en save-google-token:", data);
    const { username, accessToken } = data;
    if (!username || !accessToken) {
      console.error("Faltan parámetros:", { username, accessToken });
      return new Response(JSON.stringify({ error: "Faltan parámetros" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await prisma.user.update({
      where: { username },
      data: { googleAccessToken: accessToken },
      select: { username: true, googleAccessToken: true },
    });

    console.log("Usuario actualizado correctamente:", user);
    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error guardando token de Google:", error);
    return new Response(JSON.stringify({ error: error.message || "Error interno" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
