# Pet Rock Life Client

React + Three.js client for Pet Rock Life.

The client connects directly to ROCK for live multiplayer state. ROCK sends world snapshots, and gameplay events use ROCK signals.

## Run

```bash
pnpm install
pnpm dev
```

Useful environment values:

```env
VITE_ROCK_URL=ws://localhost:3000
VITE_SENTRY_DSN=
```

`VITE_ROCK_URL` points directly to the ROCK WebSocket endpoint. Pass the full `ws://` or `wss://` URL. The app origin is read from `window.location.origin`. In a Farcaster Mini App, the client gets a Quick Auth token from the Mini App SDK. In a normal browser, it can connect anonymously.

## Stack

- React Router
- React Three Fiber
- Rapier
- Jotai and Zustand
- ROCK WebSocket snapshots and signals
