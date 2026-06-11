# MASA Member Intake & Triage Copilot

An AI-powered emergency triage tool built for MASA (Medical Air Services Association). Members or agents describe an emergency situation; Claude analyzes it and returns a structured triage assessment including coverage status, urgency level, recommended action, and a draft member response.

## Built with

- React + Vite
- Anthropic Claude API (claude-opus-4-8)
- Vanilla CSS

## Setup

1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env` and add your Anthropic API key
4. Run `npm run dev`

## Features

- Chat-style intake interface
- Real-time AI triage powered by Claude
- Structured output: urgency, coverage status, rationale, recommended action, draft response
- Example scenarios for quick demo
- Keyboard shortcut: Enter to submit

## Deploy

Works out of the box on Vercel or Netlify. Set `VITE_ANTHROPIC_API_KEY` as an environment variable in your deployment settings.

> Note: This demo calls the Anthropic API directly from the browser. For production, route requests through a backend to keep the API key secure.
