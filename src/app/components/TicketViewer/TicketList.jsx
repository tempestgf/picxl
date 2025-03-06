import { FaBuilding, FaCalendarAlt, FaEuroSign, FaEye, FaTrash, FaTicketAlt } from "react-icons/fa";

export function TicketList({ filteredTickets, onImageClick, onDeleteTicket }) {
  const formatDate = (dateValue) => {
    const dt = new Date(dateValue);
    if (isNaN(dt.getTime())) return "";
    const day = dt.getDate();
    const month = dt.getMonth() + 1;
    const year = dt.getFullYear();
    const hours = dt.getHours();
    const minutes = dt.getMinutes();
    return `${day}-${month}-${year} ${hours}:${minutes < 10 ? "0" + minutes : minutes}`;
  };

  return (
    <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="max-h-[60vh] overflow-y-auto rounded-lg bg-white dark:bg-gray-800">
        <table className="min-w-full text-base">
          <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10 shadow-sm">
            {/* ... table header ... */}
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTickets.map((ticket, index) => (
              // ... ticket row content ...
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
