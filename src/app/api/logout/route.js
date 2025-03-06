import { cookies } from "next/headers";

export async function POST(request) {
  const cookieStore = cookies();
  // Se establece la cookie "token" con fecha de expiración en el pasado
  cookieStore.set("token", "", {
    httpOnly: true,
    path: "/",
    expires: new Date(0),
  });
  return new Response(JSON.stringify({ message: "Logout exitoso" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
