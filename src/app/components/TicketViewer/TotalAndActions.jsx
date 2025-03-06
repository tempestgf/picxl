import { FaFileExcel, FaSync, FaSyncAlt, FaEuroSign } from "react-icons/fa";

export function TotalAndActions({
  totalAmount,
  downloading,
  updating,
  isAdmin,
  handleDownloadExcel,
  handleUpdateDrive
}) {
  return (
    <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 p-5 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-gray-200 dark:border-gray-700 rounded-b-xl shadow-lg z-20">
      {/* ... Total and actions content ... */}
    </div>
  );
}
