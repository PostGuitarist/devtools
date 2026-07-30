# DevTools

A fast, fully client-side toolkit for everyday developer tasks — format, encode,
decode, and generate, all in the browser. Nothing you paste ever leaves your
machine: there's no backend, no API routes, no database, and no accounts.

## Tools

**Formatters** — JSON, XML, SQL

**Encoders** — Base64, URL, HTML Entities, JWT Decoder, Timestamp Converter

**Generators** — UUID, Lorem Ipsum, Password, Hash (MD5/SHA-1/SHA-256/SHA-512)

**Colors** — Color Converter, Gradient Generator

**Text** — Text Diff, Case Converter, Regex Tester

## Platform features

- **Command palette** (`Cmd/Ctrl+K`) — jump to any tool, with favorites and
  recents surfaced first.
- **Favorites & history** — starred tools and a full, searchable visit history
  (`/history`), persisted locally.
- **Shareable links** — click Share on a supporting tool to copy a link that
  restores your input via the URL hash — no server round-trip.
- **Tool chaining** — click "Send to..." on a supporting tool to pass its
  output straight into another tool; the receiving tool prompts before
  applying it.
- **Installable / offline** — the app is a PWA; once you've opened a tool it
  keeps working without a network connection.

Share links and tool chaining are wired into a representative set of tools
(base64-encoder, url-encoder, html-entities, json-formatter, xml-formatter,
plus every tool built after that point) as a reference for extending the
same pattern to the rest of the catalog.

## Architecture

- **Next.js 16** (App Router) + **React 19** + **TypeScript**.
- **Styling:** Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) (new-york
  style) on Radix UI primitives, `lucide-react` icons.
- **State:** Zustand, persisted to `localStorage` (favorites, history, and
  the transient tool-chaining transfer object).
- **Editor:** `@monaco-editor/react`, with Monaco's assets self-hosted under
  `/public/vs` (copied by `scripts/copy-monaco-assets.mjs` on install) so the
  editor works offline instead of fetching from a CDN.
- **Registry-driven:** `lib/tools-registry.ts` is the single source of truth
  for every tool's metadata (id, name, description, icon, category,
  keywords). It drives the homepage, the mega-menu, the command palette, the
  sitemap, and per-page SEO metadata simultaneously.

### Adding a new tool

1. Add an entry to `lib/tools-registry.ts`.
2. Create `lib/<tool>.ts` with the tool's pure transform logic, plus
   `lib/<tool>.test.ts`.
3. Create `app/tools/<tool-id>/client.tsx` (the `"use client"` UI, wrapped in
   `<ToolLayout>`) and `app/tools/<tool-id>/page.tsx` (a thin Server
   Component exporting `metadata` via `buildToolMetadata(id)` and rendering
   the client component) — see any existing tool for the pattern.
4. Optionally wire up `shareState` / `sendValue` on `<ToolLayout>` and an
   `<IncomingTransferBanner>` to participate in share links and chaining.

## Development

```bash
bun install
bun run dev      # start the dev server at http://localhost:3000
bun run test     # run the Vitest suite
bun run typecheck
bun run lint
bun run build
```

CI (`.github/workflows/ci.yml`) runs lint, typecheck, test, and build on
every pull request and push to `main`.

## Roadmap

- Extend share links and tool chaining to the remaining tools.
- Add more tools (CSV/YAML converters, cron parser, mock data generator).
- Deeper accessibility coverage (contrast audit tooling in CI, not just a
  point-in-time manual pass).
