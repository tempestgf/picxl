// src/app/api/register/route.js
import { cookies } from "next/headers";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const SECRET_KEY = "mi_clave_secreta";
// Puedes definir el código beta en una variable de entorno o usar un valor por defecto
const BETA_CODE = process.env.BETA_CODE;

async function getCookieStore() {
  return Promise.resolve(cookies());
}

export async function POST(request) {
  try {
    const { username, password, betaCode } = await request.json();

    // Verifica que se hayan enviado usuario, contraseña y código beta
    if (!username || !password || !betaCode) {
      return new Response(JSON.stringify({ error: "Falta usuario, contraseña o código beta" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Valida que el betaCode sea el correcto
    if (betaCode !== BETA_CODE) {
      return new Response(JSON.stringify({ error: "Código beta incorrecto" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "El usuario ya existe" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { username, password: hashedPassword } });
    const token = jwt.sign({ username: user.username, id: user.id }, SECRET_KEY, { expiresIn: "1h" });
    const cookieStore = await getCookieStore();
    cookieStore.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 3600,
      sameSite: "lax",
    });
    return new Response(JSON.stringify({ message: "Usuario registrado correctamente", username: user.username }), {
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
