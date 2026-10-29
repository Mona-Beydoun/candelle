# Testing

**Tools:** Thunder Client (VS Code) for API requests, browser and Chrome DevTools for UI checks.
**Environment:** Local, `npm run dev`, http://localhost:3000. All data is fictional.

## 1. API tests performed

| # | Test | Request | Expected | Actual | Result |
|---|---|---|---|---|---|
| 1 | List orders | GET /api/orders | 200 and an array | 200 OK, array of orders returned | Pass |
| 2 | Create a valid order | POST /api/orders (3 x Vanilla Candle at 8) | 201, unique ID, total 24, Pending | Order created with a unique ID, total 24, status Pending | Pass |
| 3 | Update an order | PATCH /api/orders/{id} | 200, updated order, total recalculated by the server | Order updated, server returned the recalculated total | Pass |
| 4 | Delete an order | DELETE /api/orders/{id} | 204, no body | Order deleted, no response body | Pass |

## 2. Dashboard UI tests performed

| Check | Result |
|---|---|
| Dashboard loads and lists orders from the API | Pass |
| Orders created through the API appear in the dashboard | Pass |
| Summary counts match the order data (mobile screenshot shows 4 total, 2 pending, 2 delivered) | Pass |
| Laptop view: all content visible, no page scroll | Pass |
| Mobile view (Pixel 9, 412 x 924 in Chrome DevTools): readable, content fits, no horizontal scroll | Pass |

## 3. Evidence

Files are in `docs/evidence/`


## 4. Not tested

These were not run, so there are no results to report:
- GET a single order by ID
- Validation errors on POST (missing name, blank phone, quantity 0, -1 or 1.5, negative or non-numeric price)
- Invalid status on PATCH, empty PATCH body, attempt to change the ID, client-sent total
- Malformed JSON handling
- 404 responses for an unknown ID, including fetching a deleted order
- Keyboard navigation, and the loading, error and empty states
- Maya's acceptance scenario steps 4, 5 and 7 through the API
- `npx tsc --noEmit`, `npm run lint` and `npm run build` results were not recorded in this document

## 5. Known limitations

- Orders are stored in memory, so they reset on server restart or development reload.
- A successful build alone does not prove the order workflow works, so the API and UI tests above were run separately.