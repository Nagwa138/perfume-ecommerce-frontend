# 3d-ecommerce-frontend

A streetwear shop frontend built with React, TypeScript, and Vite. Features a scroll-driven 3D mannequin hero (React Three Fiber), a bento-grid product listing with live filtering and URL-synced search, a full product detail page with image gallery and 3D product viewer, cart/wishlist/recently-viewed state via Zustand, and a quick-view modal.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion
- React Three Fiber / Drei / Three.js
- Zustand (persisted cart, wishlist, recently viewed)
- React Router v7

## Development

```bash
npm install
npm run dev        # http://localhost:5173
```

Requires the backend API running at `http://localhost:8001`.

## Build

```bash
npm run build
```
