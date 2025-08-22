"use client";

import React, { useEffect, useMemo, useState } from "react";
import { RequestStatus } from "@/lib/types/request";
import Pagination from "@/components/molecules/Pagination";
import { StatusDropdown } from "@/components/molecules/StatusDropdown";
import { BatchStatusDropdown } from "@/components/molecules/BatchStatusDropdown";
import { formatCamelCase, formatDate } from "@/lib/utils/strings";
import { PaginatedResponse } from "@/lib/types/apiResponse";
import { FiTrash2 } from "react-icons/fi";

const TABS: Array<"all" | RequestStatus> = [
  "all",
  RequestStatus.PENDING,
  RequestStatus.APPROVED,
  RequestStatus.COMPLETED,
  RequestStatus.REJECTED,
];

async function fetchRequests(page: number, status?: "all" | RequestStatus): Promise<PaginatedResponse> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  if (status && status !== "all") params.set("status", status);
  const response = await fetch(`/api/request?${params.toString()}`, { method: "GET", headers: { "Content-Type": "application/json" }});
  if (!response.ok) throw new Error(`Errored while fetching requests: ${response.status}`);
  return response.json();
}

async function patchStatus(id: string, status: RequestStatus) {
  const response = await fetch("/api/request", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
  if (!response.ok) throw new Error(`Errored while editing requests: ${response.status}`);
}

async function batchPatchStatus(ids: string[], status: RequestStatus) {
  const response = await fetch("/api/request", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids, status }) });
  if (!response.ok) throw new Error(`Errored while batch editing requests: ${response.status}`);
}

async function batchDelete(ids: string[]) {
  const response = await fetch("/api/request", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
  if (!response.ok) throw new Error(`Errored while batch editing requests: ${response.status}`);
}

export default function ItemRequestsTable() {
  const [activeTab, setActiveTab] = useState<"all" | RequestStatus>("all");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const selectedCount = selected.size;

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchRequests(page, activeTab)
      .then((d) => {
        setData(d);
        const pageIds = new Set(d.items.map((i) => i._id));
        setSelected((prev) => {
          const next = new Set<string>();
          for (const id of prev) if (pageIds.has(id)) next.add(id);
          return next;
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [activeTab, page]);

  const items = useMemo(() => data?.items ?? [], [data?.items]);

  const allOnPageSelected = useMemo(() => {
    if (!items.length) return false;
    return items.every((it) => selected.has(it._id));
  }, [items, selected]);

  function toggleSelectAll() {
    const pageIds = items.map((i) => i._id);
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function toggleRequest(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      
      if (next.has(id)) next.delete(id) 
      else next.add(id);

      return next;
    });
  }

  async function handleStatusChange(id: string, status: RequestStatus) {
    setData((prev) =>
      prev ? { ...prev, items: prev.items.map((it) => it._id === id ? { ...it, status, lastEditedDate: new Date().toISOString() } : it) } : prev
    );
    try {
      await patchStatus(id, status);
      if (activeTab !== "all") {
        const refreshed = await fetchRequests(page, activeTab);
        setData(refreshed);
      }
    } catch {
      const refreshed = await fetchRequests(page, activeTab);
      setData(refreshed);
      setError("Failed to update status");
    }
  }

  async function handleBatchStatus(status: RequestStatus) {
    if (!selectedCount) return;
    const ids = Array.from(selected);
    setData((prev) =>
      prev ? { ...prev, items: prev.items.map((it) => selected.has(it._id) ? { ...it, status, lastEditedDate: new Date().toISOString() } : it) } : prev
    );
    try {
      await batchPatchStatus(ids, status);
      const refreshed = await fetchRequests(page, activeTab);
      setData(refreshed);
      setSelected(new Set());
    } catch {
      const refreshed = await fetchRequests(page, activeTab);
      setData(refreshed);
      setError("Failed to batch update status");
    }
  }

  async function handleBatchDelete() {
    if (!selectedCount) return;
    const ids = Array.from(selected);
    setData((prev) => (prev ? { ...prev, items: prev.items.filter((it) => !selected.has(it._id)) } : prev));
    try {
      await batchDelete(ids);
      const refreshed = await fetchRequests(page, activeTab);
      setData(refreshed);
      setSelected(new Set());
    } catch {
      const refreshed = await fetchRequests(page, activeTab);
      setData(refreshed);
      setError("Failed to batch delete");
    }
  }

  return (
    <div className="w-full max-w-6xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">Item Requests</h2>
        <div className="flex items-center gap-3">
          <BatchStatusDropdown onSelect={handleBatchStatus} disabled={selectedCount === 0} />
          <button
            onClick={handleBatchDelete}
            disabled={selectedCount === 0}
            className={`flex h-10 w-10 items-center justify-center rounded-md border ${
              selectedCount === 0 ? "cursor-not-allowed border-gray-200 text-gray-300" : "border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
            aria-label="Delete selected"
            title="Delete selected"
          >
            <FiTrash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="mb-4 flex gap-3">
        {TABS.map((tab) => {
          return (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); setSelected(new Set()); }}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              {formatCamelCase(tab)}
            </button>
          );
        })}
      </div>

      <div className="overflow-visible rounded-xl border border-gray-200">
        <table className="min-w-full table-fixed divide-y divide-gray-200">
          <colgroup>
            <col className="w-12" />
            <col />
            <col />
            <col className="w-40" />
            <col className="w-40" />
            <col className="w-[220px]" />
          </colgroup>

          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all on page"
                  checked={allOnPageSelected && items.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Name</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Item Requested</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Created</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Updated</th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 bg-white">
            {loading && (
              <tr><td colSpan={6} className="px-6 py-6 text-center text-sm text-gray-500">Loading…</td></tr>
            )}
            {error && !loading && (
              <tr><td colSpan={6} className="px-6 py-6 text-center text-sm text-rose-600">{error}</td></tr>
            )}
            {!loading && items.length === 0 && !error && (
              <tr><td colSpan={6} className="px-6 py-6 text-center text-sm text-gray-500">No requests found.</td></tr>
            )}

            {items.map((it) => {
              const checked = selected.has(it._id);
              return (
                <tr key={it._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      aria-label={`Select ${it.requestorName} - ${it.itemRequested}`}
                      checked={checked}
                      onChange={() => toggleRequest(it._id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{it.requestorName}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{it.itemRequested}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{formatDate(it.createdDate)}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{it.lastEditedDate ? formatDate(it.lastEditedDate) : "—"}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <StatusDropdown value={it.status} onChange={(s) => handleStatusChange(it._id, s)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data && (
        <div className="mt-4 flex items-center justify-end">
          <Pagination
            pageNumber={data.page}
            pageSize={data.pageSize}
            totalRecords={data.total}
            onPageChange={(p) => setPage(Math.max(1, p))}
          />
        </div>
      )}
    </div>
  );
}
