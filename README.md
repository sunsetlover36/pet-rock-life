# Pet Rock Life

Pet Rock Life is an experimental multiplayer web game about wandering around with a pet rock.

The game is split into two small pieces:

- `client/` - the React + Three.js browser client.
- `server/` - the ROCK gamemode and example runtime config.

This repo is intentionally a game experiment, not a production-grade framework showcase. It grew through fast iterations, Farcaster Mini App experiments, and a migration from a Node backend to a Lua gamemode running on ROCK.

## ROCK

The server runs on ROCK, a Lua-scripted multiplayer server runtime:

<https://github.com/sunsetlover36/rock>

This repository does not include ROCK binaries. Build ROCK from source or download/build a trusted binary from the ROCK repository, then place it wherever you run the server.

## Run

Start the server:

```bash
cd server
cp .env.example .env
cp config.example.toml config.toml
rock ignite
```

Start the client:

```bash
cd client
pnpm install
pnpm dev
```

Set `VITE_ROCK_URL` to the ROCK WebSocket URL when running the client outside the default local setup.

## Auth

Pet Rock Life supports Farcaster Mini App sessions through ROCK Farcaster Quick Auth. Browser sessions can also join anonymously, which is useful for local development and for players outside a Mini App.

## Status

This is the open-source shape of the current ROCK version of the game. The old Node/Fastify/Prisma backend is intentionally not part of this tree anymore; gameplay state now lives in the Lua gamemode.

## License

MPL-2.0.
