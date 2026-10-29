# Review

## 1. Trace one Add Order action

1. In the dashboard I click "+ Add order". This opens the form in `components/OrderFormModal.tsx`.
2. I fill in the customer name, phone, product, quantity, and unit price, then submit. The `handleSubmit` function calls `fetch("/api/orders", { method: "POST", ... })` with those five fields. The form never sends a total.
3. Next.js routes the request to the `POST` function in `app/api/orders/route.ts`.
4. The handler reads the body inside a `try/catch`, so malformed JSON returns `400` instead of crashing. Then it calls `validateNewOrder` from `lib/orders.ts`. If validation fails, it returns `400` with an error message.
5. If the input is valid, `createOrder` in `lib/orders.ts` generates a unique ID with `crypto.randomUUID()`, calculates the total, sets the status to `Pending`, and saves the order in the in-memory store.
6. The handler returns `201` with the new order as JSON.
7. Back in the form, the code checks `response.ok`, closes the popup, and tells the dashboard to refresh. The dashboard calls `GET /api/orders` again, so the list and the summary counts show the new order.

## 2. Where is the total calculated, and why does it matter?

The total is calculated on the server by the `calculateTotal` function in `lib/orders.ts`. It is called from `createOrder` and again from `updateOrder` every time an order is saved. It converts the unit price to integer cents, multiplies by the quantity, and converts back, which avoids JavaScript decimal errors.

This matters because the server is the source of truth. The form shows an "estimated total", but it is only a preview. If the client could send the total, anyone using Postman or Thunder Client could store a wrong price, such as a total of 0. Since the server ignores any client-sent total and always recalculates it, the stored total always matches quantity multiplied by unit price.

## 3. One invalid request

I did not run an invalid-request test in Thunder Client, so I do not have a recorded response to show. Based on my code, a request such as `PATCH /api/orders/{id}` with `{"quantity": -2}` should fail like this: `validateOrderChanges` in `lib/orders.ts` calls `parseQuantity`, which rejects anything that is not a positive integer, so the handler returns `400` with the message "Quantity must be a positive integer".

The stored data should stay unchanged because validation finishes completely before `updateOrder` is called. If any field is invalid, the function returns early and the store is never touched. I have not verified this with a test, so I list it as not tested in `TESTING.md`.

## 4. PATCH versus replacing an entire object

PATCH changes only the fields that are sent and keeps everything else. For example, I can send only `{"quantity": 4, "status": "Preparing"}` and the customer name, phone, and product stay the same. Replacing the whole object (as PUT does) means the client must send the full object, and any field left out is lost or rejected.

In my API, PATCH only reads an allowlist of editable fields: `customerName`, `phone`, `productName`, `quantity`, `unitPrice`, and `status`. Server-owned fields like `id` and `total` are ignored even if the client sends them.

## 5. What happens to orders after a server restart?

Orders are kept in an in-memory array on the server, stored on `globalThis` so all route handlers share the same data. When the server restarts, the array is rebuilt from the three fictional seed orders, so any orders I added, edited, or deleted are lost. Development reloads can also reset the data. This would not work reliably with several server instances. A real database would fix this, but it was out of scope for this assignment.

## 6. An AI suggestion I corrected

An AI suggestion told me to add `export const dynamic = "force-dynamic";` to both route files so the GET responses would not be cached. When I opened `http://localhost:3000/api/orders`, Next.js showed a Build Error: Route segment config "dynamic" is not compatible with `nextConfig.cacheComponents`. The error pointed to line 4 of `app/api/orders/route.ts`.

I removed that line from both route files and the error went away. Then I confirmed that `GET /api/orders` still returned the orders correctly, and later the dashboard showed new orders right after I added them. So the line was not needed in this project.

I also used GitHub Copilot to style the dashboard (colors, layout, fonts). I gave it prompts that said to change only styling and not the fetch calls, state, or logic, and I checked the results in the browser on a laptop view and a mobile view.