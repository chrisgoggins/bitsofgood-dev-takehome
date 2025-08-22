"use client";

import { useState } from "react";
import { RequestStatus } from "@/lib/types/request";
import { StatusIcon } from "@/components/icons/StatusIcon";

export function BatchStatusDropdown({
  onSelect,
  disabled,
}: {
  onSelect: (s: RequestStatus) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Mark As</span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen(o => !o)}
          className={`flex items-center justify-between gap-3 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700
            ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"} focus:outline-none focus:ring-2 focus:ring-blue-400`}
        >
          <span>Status</span>
          <svg className={`h-4 w-4 text-gray-600 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>

      {open && !disabled && (
        <ul
          className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"  // z-50
          role="listbox"
        >
          {Object.values(RequestStatus).map((s) => (
            <li key={s} className="py-1">
              <button
                className="w-full text-left"
                onClick={() => { onSelect(s); setOpen(false); }}
              >
                <StatusIcon status={s} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
