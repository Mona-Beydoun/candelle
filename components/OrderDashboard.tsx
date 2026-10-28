"use client";

import { useEffect, useState } from "react";
import type { Order } from "@/lib/orders";

const money = (n: number) => `$${n.toFixed(2)}`;

const statusStyles: Record<Order["status"], string> = {
  Pending: "bg-[#fff0c9] text-[#704607] [&_.status-dot]:bg-[#a45b08]",
  Preparing: "bg-[#e6ecef] text-[#405563] [&_.status-dot]:bg-[#586f7d]",
  Delivered: "bg-[#e4ebdf] text-[#40583c] [&_.status-dot]:bg-[#526b49]",
};

export default function OrderDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

const [reloadKey, setReloadKey] = useState(0);

useEffect(() => {
  let cancelled = false;

  async function load() {
    try {
      const response = await fetch("/api/orders");
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Server returned an error");
      }
      const data: Order[] = await response.json();
      if (!cancelled) {
        setOrders(data);
        setLoadError(null);
      }
    } catch {
      if (!cancelled) setLoadError("We couldn't load the orders. Please try again.");
    } finally {
      if (!cancelled) setLoading(false);
    }
  }

  load();
  return () => {
    cancelled = true;
  };
}, [reloadKey]);

// Call this to re-fetch the list (after add, edit, delete, or Retry)
function refresh() {
  setReloadKey((k) => k + 1);
}

function retry() {
  setLoading(true);
  setLoadError(null);
  refresh();
}

  // Summary counts are derived from the real order data
  const total = orders.length;
  const pending = orders.filter((o) => o.status === "Pending").length;
  const delivered = orders.filter((o) => o.status === "Delivered").length;

  return (
    <div className="dashboard-layout relative z-10 mx-auto grid min-h-0 w-full max-w-7xl flex-1 grid-cols-1 px-4 py-3 sm:px-6 lg:grid-cols-[38fr_62fr] lg:gap-6 lg:px-8">
      <section className="brand-column flex min-h-0 flex-col justify-center">
        <div className="brand-copy">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f5b94a] sm:text-sm">
            NOUR CANDLE STUDIO · BEIRUT
          </p>
          <h1 className="mt-3 font-serif text-5xl leading-none tracking-tight text-[#fff8e9] lg:text-7xl">
            Candelle
          </h1>
          <div aria-hidden="true" className="brand-divider mt-4 h-px w-16 bg-[#f5b94a]/70" />
          <p className="brand-subtitle mt-4 max-w-sm text-xl leading-7 text-[#f4e8d4]">
            Every order, from first message to doorstep.
          </p>
        </div>
      </section>

      <section aria-label="Orders" className="orders-panel flex min-h-0 flex-col gap-4">
        <section
          aria-label="Order summary"
          className="summary-cards grid shrink-0 grid-cols-3 gap-2 sm:gap-3 lg:gap-3"
        >
          <SummaryCard label="Total orders" value={total} />
          <SummaryCard label="Pending" value={pending} />
          <SummaryCard label="Delivered" value={delivered} />
        </section>

        <div className="orders-card flex min-h-[360px] min-w-0 flex-1 flex-col rounded-3xl border p-3 sm:p-4">
          <div className="orders-heading mb-3 flex shrink-0 items-center justify-between gap-4">
            <h2 className="font-serif text-2xl tracking-tight text-[#faf3e3] sm:text-3xl">
              Orders
            </h2>
            <div aria-hidden="true" className="h-9 w-24 shrink-0" />
          </div>

          <div className="orders-table-header sticky top-0 z-10 mb-2 hidden grid-cols-[minmax(0,1.35fr)_minmax(0,1.5fr)_0.55fr_0.8fr_1fr] gap-4 border-b px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] lg:grid">
            <span>Customer</span>
            <span>Product</span>
            <span>Qty</span>
            <span>Total</span>
            <span>Status</span>
          </div>

          <div className="orders-rows flex min-h-0 flex-1 flex-col overflow-y-auto">
            {loading && (
              <p role="status" className="rounded-xl border border-[#e0a030]/35 bg-[#1c130e]/65 p-4 text-sm text-[#faf3e3]">
                Loading orders...
              </p>
            )}

            {!loading && loadError && (
              <div role="alert" className="rounded-xl border border-red-200/50 bg-[#1c130e]/65 p-4 shadow-sm">
                <p className="mb-3 text-sm text-[#ffe0d8]">{loadError}</p>
                <button
                  onClick={retry}
                  className="rounded-full bg-[#f5b94a] px-5 py-2 text-sm font-semibold text-[#2a1c14] shadow-sm transition hover:bg-[#e0a030] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8a4b12]"
                >
                  Retry
                </button>
              </div>
            )}

            {!loading && !loadError && orders.length === 0 && (
              <p className="rounded-xl border border-dashed border-[#f5b94a]/45 bg-[#1c130e]/65 p-5 text-center text-sm text-[#faf3e3]">
                No orders yet. Add the first one to get started.
              </p>
            )}

            {!loading && !loadError && orders.length > 0 && (
              <ul className="orders-list flex flex-col gap-[10px]">
                {orders.map((order) => (
                  <li
                    key={order.id}
                    className="order-row grid min-h-[68px] grid-cols-6 items-center gap-x-2 gap-y-1.5 rounded-xl border border-transparent border-l-4 border-l-transparent p-2.5 transition duration-200 lg:h-[68px] lg:min-h-[68px] lg:max-h-[68px] lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1.5fr)_0.55fr_0.8fr_1fr] lg:gap-4 lg:px-4"
                  >
                    <div className="col-span-3 min-w-0 lg:col-span-1">
                      <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#e8bd68]/90 lg:hidden">
                        Customer
                      </p>
                      <p className="truncate text-sm font-medium text-[#faf3e3]">{order.customerName}</p>
                    </div>
                    <div className="col-span-3 min-w-0 lg:col-span-1">
                      <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#e8bd68]/90 lg:hidden">
                        Product
                      </p>
                      <p className="truncate text-sm text-[#f3e8d5]">{order.productName}</p>
                    </div>
                    <div className="col-span-2 lg:col-span-1">
                      <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#e8bd68]/90 lg:hidden">
                        Qty
                      </p>
                      <p className="text-sm text-[#faf3e3]">{order.quantity}</p>
                    </div>
                    <div className="col-span-2 lg:col-span-1">
                      <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#e8bd68]/90 lg:hidden">
                        Total
                      </p>
                      <p className="text-sm font-semibold text-[#faf3e3]">{money(order.total)}</p>
                    </div>
                    <div className="col-span-2 lg:col-span-1">
                      <p className="mb-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#e8bd68]/90 lg:hidden">
                        Status
                      </p>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyles[order.status]}`}
                      >
                        <span aria-hidden="true" className="status-dot h-1.5 w-1.5 rounded-full" />
                        {order.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="summary-card flex min-h-[68px] min-w-0 flex-col items-start justify-center gap-1 rounded-2xl border px-2.5 py-2.5 text-left sm:px-3 lg:min-h-[84px] lg:px-4 lg:py-3">
      <p className="summary-label text-[9px] font-semibold uppercase leading-tight tracking-[0.12em] text-[#faf3e3] sm:text-[10px] lg:text-xs">
        {label}
      </p>
      <p className="summary-value font-serif text-2xl leading-none text-[#f5b94a] lg:text-3xl">
        {value}
      </p>
    </div>
  );
}
