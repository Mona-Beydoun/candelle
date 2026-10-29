# Plan

## Client problem
Nour runs a small handmade-candle business in Beirut. Orders arrive through Instagram and WhatsApp and get scattered across a notebook and chats. She cannot reliably see which orders exist or which still need preparation.

## Required features
1. List orders (customer, product, quantity, total, status)
2. View an order's details
3. Add an order
4. Update an order and change its status
5. Delete an order with confirmation
6. Summary counts (total, pending, delivered)

## Endpoints
| Method | Endpoint | Success |
|---|---|---|
| GET | /api/orders | 200 |
| POST | /api/orders | 201 |
| GET | /api/orders/[id] | 200 |
| PATCH | /api/orders/[id] | 200 |
| DELETE | /api/orders/[id] | 204 |

## Implementation steps
1. Set up Next.js 16, TypeScript, Tailwind, repository and branch
2. Build the data layer (`lib/orders.ts`): in-memory store, validation, total calculation
3. Build the Route Handlers
4. Build the dashboard and connect it with `fetch`
5. Add the form, details, edit, and delete popups
6. Test with Thunder Client and in the browser
7. Write the documentation