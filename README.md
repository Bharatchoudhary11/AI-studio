# AI Studio

AI Studio is a small demonstration app built with **React**, **TypeScript**, **Vite** and **Tailwind CSS**. It lets you upload an image, describe an edit prompt and mock an AI "generation" that returns an updated image. Results are stored in a local history and can be revisited later.

## Installation

1. Install [Node.js](https://nodejs.org/) (v18 or later).
2. Install dependencies:

   ```bash
   npm install
   ```

## Running the app

Start the development server with Vite:

```bash
npm run dev
```

The site is served at <http://localhost:5173> by default.

To create an optimized production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Testing

This project does not yet include an automated test suite. Running `npm test` will report `missing script: test`.

For basic checks you can run ESLint:

```bash
npm run lint
```

## Design notes

- **Mocked API** – `src/api.ts` exports `mockGenerate`, a Promise‑based function that simulates calling an image generation model and randomly fails to emulate transient errors.
- **App component** – `src/App.tsx` handles file uploads, resizes large images on the client, dispatches requests to the mock API and retries failed generations with exponential backoff. Requests can be aborted and the last five successful generations are persisted to `localStorage`.
- **Lazy history** – the `History` component is dynamically imported to reduce the initial bundle. It renders the recent generations and allows re‑selecting them.
- **Error boundary & service worker** – `src/ErrorBoundary.tsx` guards the UI against runtime failures, and `src/main.tsx` registers a service worker (if available) for offline support.

