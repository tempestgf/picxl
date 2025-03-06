import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data"; // Nota: Esta librería muestra un warning de deprecación. Considera usar "formdata-node" u otra alternativa.
import os from "os";
import path from "path";

export const config = {
  api: {
    bodyParser: true, // Procesamos JSON
  },
};

const FOLDER_NAME = "OCR_Results";
const LOCAL_EXCEL = "resultado_recibo.xlsx";

// Función para obtener o crear la carpeta en Drive
async function getOrCreateDriveFolder(token, folderName) {
  const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}`;
  let response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  let result = await response.json();
  if (result.files && result.files.length > 0) {
    return result.files[0].id;
  } else {
    return createDriveFolder(token, folderName);
  }
}

async function createDriveFolder(token, folderName) {
  const payload = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
  };
  const response = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  return result.id;
}

async function addPublicPermission(token, fileId) {
  const payload = {
    role: "reader",
    type: "anyone",
  };
  await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

async function uploadOrUpdateExcel(accessToken, fileName, folderId, filePath) {
  // 1. Buscar si ya existe un archivo con ese nombre en la carpeta
  const query = encodeURIComponent(
    `mimeType='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' and name='${fileName}' and '${folderId}' in parents and trashed=false`
  );
  const listUrl = `https://www.googleapis.com/drive/v3/files?q=${query}`;
  let resp = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const listData = await resp.json();
  let existingFileId =
    listData.files && listData.files.length > 0
      ? listData.files[0].id
      : null;

  // 2. Si existe, eliminar el archivo
  if (existingFileId) {
    const deleteUrl = `https://www.googleapis.com/drive/v3/files/${existingFileId}`;
    await fetch(deleteUrl, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  // 3. Preparamos el archivo para enviar (usando FormData)
  const fileStream = fs.createReadStream(filePath);
  const form = new FormData();
  const metadata = JSON.stringify({
    name: fileName,
    parents: [folderId],
  });
  form.append("metadata", metadata, {
    contentType: "application/json; charset=UTF-8",
  });
  form.append("file", fileStream);

  const createUrl =
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
  resp = await fetch(createUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
  
  // Intentamos leer la respuesta como texto para detectar posibles errores
  const responseText = await resp.text();
  let createData;
  try {
    createData = JSON.parse(responseText);
  } catch (e) {
    console.error("Error al parsear la respuesta JSON de Drive:", responseText);
    throw new Error("Error al subir el archivo a Drive: " + responseText);
  }
  
  const newFileId = createData.id;
  if (!newFileId) {
    throw new Error("No se obtuvo el ID del archivo tras la subida. Respuesta: " + responseText);
  }

  // 4. Asignamos permiso público
  await addPublicPermission(accessToken, newFileId);

  // 5. Obtenemos el enlace público del archivo
  resp = await fetch(
    `https://www.googleapis.com/drive/v3/files/${newFileId}?fields=webViewLink`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const info = await resp.json();
  return info.webViewLink;
}

export async function POST(req) {
  try {
    // Se espera que el cliente envíe un JSON con:
    // - base64Excel: la cadena base64 del archivo Excel (sin el prefijo "data:...")
    // - fileName: e.g., "resultado_recibo.xlsx"
    // - token: el token de acceso de Google
    const { base64Excel, fileName, token } = await req.json();
    if (!base64Excel || !fileName || !token) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    // Convertimos la cadena base64 en un buffer
    const fileBuffer = Buffer.from(base64Excel, "base64");
    // Generamos la ruta del archivo temporal usando os.tmpdir() para compatibilidad
    const tmpPath = path.join(os.tmpdir(), `${Date.now()}-${fileName}`);
    console.log("Archivo temporal guardado en:", tmpPath);
    fs.writeFileSync(tmpPath, fileBuffer);

    // Obtenemos (o creamos) la carpeta en Drive
    const folderId = await getOrCreateDriveFolder(token, FOLDER_NAME);
    // Subimos o actualizamos el archivo Excel en Drive
    const webViewLink = await uploadOrUpdateExcel(token, fileName, folderId, tmpPath);
    // Eliminamos el archivo temporal
    fs.unlinkSync(tmpPath);

    return new Response(JSON.stringify({ webViewLink }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing excel update:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
