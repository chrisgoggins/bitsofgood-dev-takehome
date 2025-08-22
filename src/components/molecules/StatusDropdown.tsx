"use client";

import { RequestStatus } from "@/lib/types/request";
import { useState } from "react";
import { StatusIcon } from "@/components/icons/StatusIcon";

export const StatusDropdown = ({
  value,
  onChange,
}: {
  value: RequestStatus;
  onChange: (s: RequestStatus) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative z-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center justify-between gap-2 rounded-md bg-white px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <StatusIcon status={value} />
        <svg
          className={`h-4 w-4 text-gray-600 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <ul
          className="absolute right-0 z-10 mt-1 w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
          role="listbox"
        >
          {Object.values(RequestStatus).map((s) => (
            <li key={s} className="py-1">
              <button
                className="w-full text-left"
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
              >
                <StatusIcon status={s} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
