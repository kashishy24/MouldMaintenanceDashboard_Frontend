// src/partials/parameters/CustomToggle.jsx
import { FaCheck } from "react-icons/fa";

export default function CustomToggle({ active, onClick, label }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onClick}
        className={`w-12 h-6 flex items-center rounded-full px-1 transition-colors duration-300 ${
          active ? "bg-[#3c51d2]" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white transform transition-transform duration-300 flex items-center justify-center ${
            active ? "translate-x-6" : "translate-x-0"
          }`}
        >
          {active && <FaCheck className="w-2.5 h-2.5 text-[#3c51d2]" />}
        </div>
      </button>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
    </div>
  );
}
