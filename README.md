# Candelle: Nour's Order Desk

**Author:** Mona Beydoun
**Branch:** `assignment-4-nour-order-desk`

## Summary

Candelle is an internal order dashboard for Nour Candle Studio, a small handmade-candle business in Beirut. Nour can add, view, edit, change the status of, and delete orders, and see summary counts for total, pending, and delivered orders. The dashboard talks to a REST API built with Next.js Route Handlers. The server validates all input and calculates every total.

**Stack:** Next.js 16, TypeScript, Tailwind CSS.

## Features

- List orders with customer, product, quantity, total, and status
- View full order details in a popup
- Add an order (the server sets the ID, total, and the starting status `Pending`)
- Edit an order and change its status (`Pending`, `Preparing`, `Delivered`)
- Delete an order with a confirmation step
- Summary counts derived from the real order data
- Loading, error (with retry), and empty states

## Installation and run steps

```bash
git clone https://github.com/Mona-Beydoun/candelle.git
cd candelle
git switch assignment-4-nour-order-desk
npm install
npm run dev
```

Open http://localhost:3000.

To run the checks:

```bash
npm run lint
npm run build
```

## Storage limitation

Orders are stored in an in-memory store on the server (`lib/orders.ts`). They reset to three fictional seed orders when the server restarts, and they can also reset when the development server reloads. This approach would not work across multiple server instances. There is no database. This is a deliberate limitation of the assignment.

## Data

All customer names and phone numbers in the project are fictional.

## Documents

- [Plan](docs/PLAN.md)
- [API reference](docs/API.md)
- [Testing](docs/TESTING.md)
- [Review](docs/REVIEW.md)
- [Evidence](docs/evidence/)

## Credits

Hero photo by Treedeo on Pexels.