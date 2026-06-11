# MASA Member Intake & Triage Copilot

An AI-powered emergency triage tool built for MASA (Medical Air Services Association). Members or agents describe an emergency situation; an LLM analyzes it and returns a structured triage assessment including coverage status, urgency level, recommended action, and a draft member response.

## Built with

- React + Vite (frontend)
- Vercel serverless function (backend API proxy)
- Google Gemini API (`gemini-3.5-flash`, free tier) with structured JSON output
- Vanilla CSS

## Architecture

The browser never sees the API key. The React app calls a backend endpoint (`/api/triage`), which holds `GEMINI_API_KEY` server-side and calls Gemini. The model is constrained with a JSON schema (structured output), so the response is reliably valid and parseable.

```
Browser (React)  ──POST /api/triage──>  Serverless function  ──>  Gemini API
                 <──── triage JSON ────                       <────
```

## Get a free API key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with a Google account and click **Create API key** (no credit card required)
3. Copy the key

The free tier covers low-traffic demo use. See [Gemini API pricing](https://ai.google.dev/gemini-api/docs/pricing) for current limits.

## Setup

1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env` and paste your key as `GEMINI_API_KEY`
4. Run the full stack locally with `vercel dev` (see below)

## Local development

The chat needs the `/api/triage` backend, which plain `vite` does not serve. Use the Vercel CLI via `npx` (no global install needed) to run the frontend and the function together:

```bash
npx vercel dev
```

The first run will prompt you to log in (`npx vercel login`) and link the project — accept the defaults.

`npm run dev` still works for frontend-only UI work, but triage requests will 404 until you run `npx vercel dev`.

## Features

- Chat-style intake interface
- Real-time AI triage powered by Gemini
- Structured output: urgency, coverage status, rationale, recommended action, draft response
- Example scenarios for quick demo
- Keyboard shortcut: Enter to submit
- API key kept server-side (never exposed to the browser)

## Deploy

Deploys to Vercel out of the box:

```bash
npx vercel
```

Set `GEMINI_API_KEY` as an environment variable in your Vercel project settings (Project → Settings → Environment Variables). The `/api` directory is auto-detected as a serverless function. Optionally set `GEMINI_MODEL` to override the default model.
