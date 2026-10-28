export const STATUSES = ["Pending", "Preparing", "Delivered"] as const;
export type Status = (typeof STATUSES)[number];

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  status: Status;
}

// Money: work in integer cents to avoid floating-point surprises (0.1 + 0.2 problem)
export function calculateTotal(quantity: number, unitPrice: number): number {
  const cents = Math.round(unitPrice * 100) * quantity;
  return cents / 100;
}

function makeSeed(): Order[] {
  return [
    { id: crypto.randomUUID(), customerName: "Demo Customer A", phone: "DEMO-001", productName: "Vanilla Candle", quantity: 3, unitPrice: 8, total: calculateTotal(3, 8), status: "Pending" },
    { id: crypto.randomUUID(), customerName: "Demo Customer B", phone: "DEMO-002", productName: "Cedar Candle", quantity: 2, unitPrice: 10, total: calculateTotal(2, 10), status: "Preparing" },
    { id: crypto.randomUUID(), customerName: "Demo Customer C", phone: "DEMO-003", productName: "Mini Gift Candle", quantity: 5, unitPrice: 6, total: calculateTotal(5, 6), status: "Delivered" },
  ];
}

// One shared store for every route handler in this server process.
// Stored on globalThis so dev-mode module reloads don't create separate arrays.
const globalForOrders = globalThis as unknown as { __orders?: Order[] };
const store: Order[] = (globalForOrders.__orders ??= makeSeed());
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

function parseText(value: unknown, label: string): Result<string> {
  if (typeof value !== "string" || value.trim() === "") {
    return { ok: false, error: `${label} is required and cannot be blank` };
  }
  return { ok: true, value: value.trim() };
}

function parseQuantity(value: unknown): Result<number> {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    return { ok: false, error: "Quantity must be a positive integer" };
  }
  return { ok: true, value };
}

function parseUnitPrice(value: unknown): Result<number> {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return { ok: false, error: "Unit price must be a number of 0 or more" };
  }
  // max two decimal places (small tolerance for floating-point noise)
  if (Math.abs(value * 100 - Math.round(value * 100)) > 1e-6) {
    return { ok: false, error: "Unit price can have at most two decimal places" };
  }
  return { ok: true, value };
}

function parseStatus(value: unknown): Result<Status> {
  if (typeof value !== "string" || !STATUSES.includes(value as Status)) {
    return { ok: false, error: `Status must be one of: ${STATUSES.join(", ")}` };
  }
  return { ok: true, value: value as Status };
}

function isPlainObject(body: unknown): body is Record<string, unknown> {
  return typeof body === "object" && body !== null && !Array.isArray(body);
}
export interface NewOrderInput {
  customerName: string;
  phone: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export function validateNewOrder(body: unknown): Result<NewOrderInput> {
  if (!isPlainObject(body)) return { ok: false, error: "Request body must be a JSON object" };

  const customerName = parseText(body.customerName, "Customer name");
  if (!customerName.ok) return customerName;
  const phone = parseText(body.phone, "Phone");
  if (!phone.ok) return phone;
  const productName = parseText(body.productName, "Product name");
  if (!productName.ok) return productName;
  const quantity = parseQuantity(body.quantity);
  if (!quantity.ok) return quantity;
  const unitPrice = parseUnitPrice(body.unitPrice);
  if (!unitPrice.ok) return unitPrice;

  return {
    ok: true,
    value: {
      customerName: customerName.value,
      phone: phone.value,
      productName: productName.value,
      quantity: quantity.value,
      unitPrice: unitPrice.value,
    },
  };
}

export type OrderChanges = Partial<NewOrderInput & { status: Status }>;

export function validateOrderChanges(body: unknown): Result<OrderChanges> {
  if (!isPlainObject(body)) return { ok: false, error: "Request body must be a JSON object" };

  const changes: OrderChanges = {};

  // Allowlist: only these keys are ever read. `id` and `total` are ignored.
  if ("customerName" in body) {
    const r = parseText(body.customerName, "Customer name");
    if (!r.ok) return r;
    changes.customerName = r.value;
  }
  if ("phone" in body) {
    const r = parseText(body.phone, "Phone");
    if (!r.ok) return r;
    changes.phone = r.value;
  }
  if ("productName" in body) {
    const r = parseText(body.productName, "Product name");
    if (!r.ok) return r;
    changes.productName = r.value;
  }
  if ("quantity" in body) {
    const r = parseQuantity(body.quantity);
    if (!r.ok) return r;
    changes.quantity = r.value;
  }
  if ("unitPrice" in body) {
    const r = parseUnitPrice(body.unitPrice);
    if (!r.ok) return r;
    changes.unitPrice = r.value;
  }
  if ("status" in body) {
    const r = parseStatus(body.status);
    if (!r.ok) return r;
    changes.status = r.value;
  }

  if (Object.keys(changes).length === 0) {
    return { ok: false, error: "No editable fields provided" };
  }
  return { ok: true, value: changes };
}
export function listOrders(): Order[] {
  return store.map((o) => ({ ...o }));
}

export function getOrder(id: string): Order | undefined {
  const found = store.find((o) => o.id === id);
  return found ? { ...found } : undefined;
}

export function createOrder(input: NewOrderInput): Order {
  const order: Order = {
    id: crypto.randomUUID(),
    ...input,
    total: calculateTotal(input.quantity, input.unitPrice),
    status: "Pending",
  };
  store.push(order);
  return { ...order };
}

export function updateOrder(id: string, changes: OrderChanges): Order | undefined {
  const index = store.findIndex((o) => o.id === id);
  if (index === -1) return undefined;

  const merged = { ...store[index], ...changes };
  merged.total = calculateTotal(merged.quantity, merged.unitPrice); // always recalculated
  merged.id = store[index].id; // server-owned, never changes

  store[index] = merged;
  return { ...merged };
}

export function deleteOrder(id: string): boolean {
  const index = store.findIndex((o) => o.id === id);
  if (index === -1) return false;
  store.splice(index, 1);
  return true;
}