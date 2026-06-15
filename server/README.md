# Pet Rock Life Server

ROCK gamemode for Pet Rock Life.

This folder contains the Lua gamemode and example runtime config only. It does not include a ROCK binary.

## Run

Build ROCK from <https://github.com/sunsetlover36/rock>, then run the binary from this folder:

```bash
cp .env.example .env
cp config.example.toml config.toml
rock ignite
```

The default server listens on `127.0.0.1:3000`.

## Files

- `gamemodes/pet_rock_life.lua` - game server logic.
- `config.example.toml` - example ROCK config.
- `.env.example` - local server environment.

## Auth

The config enables Farcaster auth and anonymous sessions:

```toml
[auth]
providers = ["farcaster"]
allow_anonymous = true
```

Farcaster Mini App players connect with ROCK Quick Auth. Browser players can connect without a token and receive an anonymous one-shot session.
