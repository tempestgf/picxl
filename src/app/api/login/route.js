// src/app/api/login/route.js
import { cookies } from "next/headers";
import prisma from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET_KEY = "mi_clave_secreta";

async function getCookieStore() {
  return Promise.resolve(cookies());
}

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return new Response(JSON.stringify({ error: "Falta usuario o contraseña" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return new Response(JSON.stringify({ error: "Credenciales inválidas" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return new Response(JSON.stringify({ error: "Credenciales inválidas" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const token = jwt.sign({ username: user.username, id: user.id }, SECRET_KEY, { expiresIn: "1h" });
    const cookieStore = await getCookieStore();
    cookieStore.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 3600,
      sameSite: "lax",
    });
    return new Response(JSON.stringify({ message: "Login exitoso", username: user.username }), {
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
