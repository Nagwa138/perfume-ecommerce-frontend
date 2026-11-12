# AURA Perfume — Frontend

React + TypeScript storefront for the AURA premium perfume store.

> **Two-repo project.** This repo (`frontend/`) is one half. The API lives in the sibling `backend/` repo running on port 8002. Run both simultaneously.

## Stack

- React 19 + TypeScript
- Vite 8 (port **5174**, `--strictPort`)
- Tailwind CSS v4
- Framer Motion
- React Three Fiber / Drei / Three.js (3D bottle preview)
- Zustand (persisted cart, wishlist, recently viewed)
- React Router v7
- @fontsource/cormorant-garamond (luxury serif display)

## Setup

```bash
npm install
```

Copy the env file (optional — defaults to `http://localhost:8002/api`):

```bash
copy .env.example .env
```

## Run (port 5174)

```bash
npm run dev
# → http://localhost:5174
```

The backend must be running on port 8002 (`uvicorn main:app --reload --port 8002`).

## Run alongside the clothing shop

The clothing shop frontend runs on port 5173. This shop runs on 5174 with `strictPort` so they never clash.

## Build

```bash
npm run build
```

## Key env vars

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8002/api` | Backend base URL |
