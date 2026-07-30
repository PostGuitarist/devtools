# DevTools

A fast, fully client-side toolkit for everyday developer tasks — format, encode,
decode, and generate, all in the browser. Nothing you paste ever leaves your
machine: there's no backend, no API routes, no database, and no accounts.

## Tools

**Formatters** — JSON, XML, SQL, JSON to TypeScript, JSON Validator, JSON to
CSV, YAML ↔ JSON Converter, CSS Minifier & Beautifier, HTML to Markdown,
JSON Diff

**Encoders** — Base64, URL, HTML Entities, JWT Decoder, Timestamp Converter,
Number Base Converter, Chmod Calculator, Binary to Text, Image to Base64

**Generators** — UUID, Lorem Ipsum, Password, Hash (MD5/SHA-1/SHA-256/SHA-512),
QR Code Generator, SVG to PNG, Cron Expression Generator, Mock Data Generator,
curl Command Builder

**Colors** — Color Converter, Gradient Generator, Tailwind Colors

**Text** — Text Diff, Case Converter, Regex Tester, Word Counter, Markdown
Preview

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

Share links and tool chaining are wired into every tool in the catalog —
see `app/tools/base64-encoder/client.tsx` for the reference implementation
of the pattern.

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
- **Generated data:** `lib/tailwind-palette-data.ts` (the Tailwind Colors
  tool's swatch data) is generated from `tailwindcss/theme.css` by
  `bun run generate:tailwind-palette` — re-run it after a Tailwind upgrade
  that changes the default palette.
- **Accessibility:** `eslint-plugin-jsx-a11y`'s full recommended rule set
  runs in CI via `bun run lint` (`eslint-config-next` only enables a small
  hand-picked subset by default). A handful of `vitest-axe` component scans
  — one Monaco-free tool per category — catch runtime a11y regressions via
  `bun run test`.

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

- Add more tools — several are already in `lib/tools-registry.ts` with
  `comingSoon: true` so they show up (grayed out) in the catalog ahead of
  being built: CSV to JSON, JWT Encoder, Nanoid/ULID Generator, Slugify,
  HTTP Status Code Lookup, User-Agent Parser, .env Converter, Markdown
  Table Generator.
- A full Playwright + `@axe-core/playwright` sweep across every tool route,
  as a runtime-rendered complement to the current lint rules and
  component-level `vitest-axe` scans — needs a browser provisioned in the
  CI runner, which it doesn't have today.
