import { NextResponse } from "next/server";
import { listOrders, createOrder, validateNewOrder } from "@/lib/orders";



export async function GET() {
  return NextResponse.json(listOrders(), { status: 200 });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const result = validateNewOrder(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const order = createOrder(result.value);
  return NextResponse.json(order, { status: 201 });
}