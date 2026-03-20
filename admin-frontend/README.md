# Admin Frontend (Separate)

This is a separate admin-only frontend and does not modify the existing `frontend` folder.

## Setup

1. Copy `.env.example` to `.env`.
2. Update API URLs if needed:
   - `VITE_PUBLIC_API_BASE_URL`
   - `VITE_ADMIN_API_BASE_URL`
3. Install and run:

```bash
npm install
npm run dev
```

## How auth works

- This app asks for `email` and `password` once.
- For each admin CRUD request, it sends credentials in headers:
  - `email`
  - `password`
- Backend validates via `adminAuth` middleware.

## Endpoints used

- Public read endpoints:
  - `GET /api/products`
- Protected admin endpoints:
  - `POST /api/admin/products`
  - `PUT /api/admin/products/:id`
  - `DELETE /api/admin/products/:id`
  - `POST /api/admin/products/:id/variants`
  - `PUT /api/admin/products/:productId/variants/:variantId`
  - `DELETE /api/admin/products/:productId/variants/:variantId`
