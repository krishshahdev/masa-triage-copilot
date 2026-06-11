# MASA Member Intake & Triage Copilot

An AI-powered emergency triage tool built for MASA (Medical Air Services Association). Members or agents describe an emergency situation; Claude analyzes it and returns a structured triage assessment including coverage status, urgency level, recommended action, and a draft member response.

## Built with

- React + Vite (frontend)
- Vercel serverless function (backend API proxy)
- Anthropic Claude API (`claude-opus-4-8`) with structured outputs
- Vanilla CSS

## Architecture

The browser never sees the API key. The React app calls a backend endpoint (`/api/triage`), which holds `ANTHROPIC_API_KEY` server-side and calls Claude. Claude is constrained with a JSON schema (structured outputs), so the response is always valid and parseable.

```
Browser (React)  ──POST /api/triage──>  Serverless function  ──>  Claude API
                 <──── triage JSON ────                       <────
```

## Setup

1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env` and add your Anthropic API key (`ANTHROPIC_API_KEY`)
4. Run the full stack locally with `vercel dev` (see below)

## Local development

The chat needs the `/api/triage` backend, which plain `vite` does not serve. Use the Vercel CLI to run the frontend and the function together:

```bash
npm install -g vercel
vercel dev
```

`npm run dev` still works for frontend-only UI work, but triage requests will 404 until you run `vercel dev`.

## Features

- Chat-style intake interface
- Real-time AI triage powered by Claude
- Structured output: urgency, coverage status, rationale, recommended action, draft response
- Example scenarios for quick demo
- Keyboard shortcut: Enter to submit
- API key kept server-side (never exposed to the browser)

## Deploy

Deploys to Vercel out of the box:

```bash
vercel
```

Set `ANTHROPIC_API_KEY` as an environment variable in your Vercel project settings (Project → Settings → Environment Variables). The `/api` directory is auto-detected as a serverless function.
