import * as XLSX from "xlsx";

export const generateExcelBase64 = (tickets) => {
  const headers = ["ID", "Nombre empresa", "Fecha", "Importe total", "Enlace imagen", "Tipo"];
  const data = tickets.map((ticket) => {
    const dt = new Date(ticket.dateTime);
    let formattedDate = "";
    if (!isNaN(dt.getTime())) {
      formattedDate = `${dt.getDate()}-${dt.getMonth() + 1}-${dt.getFullYear()} ${dt.getHours()}:${dt.getMinutes() < 10 ? "0" + dt.getMinutes() : dt.getMinutes()}`;
    }
    const formattedTotal = Number(ticket.total).toFixed(2) + "€";
    return [
      String(ticket.id),
      ticket.merchantName || "",
      formattedDate,
      formattedTotal,
      ticket.imageUrl ? `${ticket.imageUrl}?t=${new Date().getTime()}` : "",
      ticket.ticketType || "individual",
    ];
  });
  const rows = [headers, ...data];
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  const range = XLSX.utils.decode_range(worksheet["!ref"]);
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    const cellAddress = { c: 3, r: R };
    const cellRef = XLSX.utils.encode_cell(cellAddress);
    if (worksheet[cellRef]) {
      worksheet[cellRef].t = "s";
    }
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");
  return XLSX.write(workbook, { bookType: "xlsx", type: "base64" });
};
