import { NextResponse } from "next/server";
import { getOrder, updateOrder, deleteOrder, validateOrderChanges } from "@/lib/orders";



type RouteContext = { params: Promise<{ id: string }> };

const notFound = () => NextResponse.json({ error: "Order not found" }, { status: 404 });

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const order = getOrder(id);
  if (!order) return notFound();
  return NextResponse.json(order, { status: 200 });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;

  if (!getOrder(id)) return notFound();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const result = validateOrderChanges(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const updated = updateOrder(id, result.value);
  if (!updated) return notFound();
  return NextResponse.json(updated, { status: 200 });
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const removed = deleteOrder(id);
  if (!removed) return notFound();
  return new Response(null, { status: 204 });
}