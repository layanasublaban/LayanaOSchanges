# Life OS — code build of the Figma design

Private, single-user app: Home, Calendar, AI Assistant, Personal, Business, Lensiyana, Finance, Settings, plus a sign-in page.
Knowledge is intentionally not in v1.

## Stack
Vite 6 · React 18 · TypeScript · Tailwind v4 (`@theme` tokens in `src/styles/theme.css`) · react-router-dom 6 · lucide-react.
Fonts: Manrope Bold (headings), DM Sans (body).

## Structure
```
src/main.tsx
src/styles/{index,fonts,tailwind,theme}.css
src/app/App.tsx                 routes
src/app/auth.tsx                mock single-user session (localStorage "lifeos.session")
src/app/data/mock.ts            sample data
src/app/components/{ui,rows,AppShell}.tsx
src/app/pages/*.tsx             one file per screen
```
Responsive: sidebar layout from `lg`, bottom tab bar (Home, Calendar, Assistant, Business, More) below it.

## Merging into the Figma Make project
Copy `src/` over the Make project's `src/` (keep Make's `package.json` deps; add `react-router-dom` and `lucide-react` if missing),
then `npm install && npm run dev`.

## Notes
- Sign-in is a prototype: any email/password works. Replace `auth.tsx` with Neon Auth (passkey + two-step verification) later.
- Data is mocked in `mock.ts`; swap for the Neon + Google Calendar data layer.
- This bundle was written without running a build (no package install was possible), so run `npm run typecheck && npm run build` first.
