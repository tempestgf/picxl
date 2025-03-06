/**
 * Convierte el formato "HH:mm dd/mm/yy" o "HH:mm dd/mm/yyyy" a un objeto Date válido
 */
export function parseCustomDate(dateStr) {
  console.log("parseCustomDate recibe:", dateStr);
  const regex = /(\d{1,2}):(\d{2})\s+(\d{1,2})\/(\d{1,2})\/(\d{2,4})/;
  const match = dateStr.match(regex);
  if (match) {
    let [ , hour, minute, day, month, year ] = match;
    hour = parseInt(hour, 10);
    minute = parseInt(minute, 10);
    day = parseInt(day, 10);
    month = parseInt(month, 10) - 1;
    year = parseInt(year, 10);
    if (year < 100) {
      year += 2000;
    }
    return new Date(year, month, day, hour, minute);
  }
  const parsed = new Date(dateStr);
  if (!isNaN(parsed)) {
    return parsed;
  }
  return new Date();
}

/**
 * Formatea un objeto Date al formato "DD-MM-YY HH:mm"
 */
export function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes}`;
}
