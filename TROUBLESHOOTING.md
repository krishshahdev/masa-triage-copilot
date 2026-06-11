# Troubleshooting Log

Running log of every error hit while building/deploying this project, its root cause, and the fix. Newest issues appended at the bottom. Consult this first when a familiar-looking error reappears.

---

## 1. `git status` showed the entire home folder; remote pointed at the wrong repo
- **Symptom:** `git rev-parse --show-toplevel` returned `/Users/krish` (home dir); `git remote -v` pointed at `MortBrokerApp`.
- **Cause:** `git init` had been run in the home directory, not the project. No `.git` existed in the project.
- **Fix:** Ran `git init` inside the project folder, created a fresh GitHub repo `krishshahdev/masa-triage-copilot`, pushed only project files. (Stray `~/.git` left for the user to remove with `rm -rf ~/.git` after verifying.)

## 2. API key would be exposed in the browser
- **Symptom:** Original design called the LLM API directly from the browser with `dangerous-allow-browser`.
- **Cause:** Front-end-only architecture ships the API key to every visitor.
- **Fix:** Added a backend serverless function `api/triage.js` that holds the key server-side; the React app calls `/api/triage` instead.

## 3. `vercel: command not found` + `EACCES` on `npm install -g vercel`
- **Symptom:** `npm error code EACCES ... mkdir '/usr/local/lib/node_modules/vercel' ... permission denied`.
- **Cause:** npm's global directory is owned by root; user can't write to it without sudo.
- **Fix:** Don't install globally — use `npx vercel dev` and `npx vercel`. (Optional long-term: set a user-owned npm prefix.)

## 4. `Error: Could not load the default credentials`
- **Symptom:** On the deployed site, triage failed with a Google Cloud "default credentials" message.
- **Cause:** `GEMINI_API_KEY` was not set in Vercel (the local `.env` is git-ignored and never deploys). With no key, the `@google/genai` SDK falls back to Google ADC, which doesn't exist on Vercel.
- **Fix:** Added `GEMINI_API_KEY` in Vercel → Settings → Environment Variables and redeployed. Also added a code guard that returns a clear "Server is missing GEMINI_API_KEY" message.

## 5. `503 ... "This model is currently experiencing high demand" ... UNAVAILABLE`
- **Symptom:** Triage returned a raw 503 JSON error.
- **Cause:** The newer `gemini-3.5-flash` model was capacity-constrained on the free tier.
- **Fix:** Defaulted to `gemini-2.5-flash` (stable free-tier capacity, env-overridable via `GEMINI_MODEL`), and added auto-retry with backoff for transient 503/429 errors plus a friendly "service is busy" message.

## 6. `Unterminated string in JSON at position 78`
- **Symptom:** `JSON.parse` failed on the model's response; the JSON was cut off mid-string.
- **Cause:** Gemini 2.5 Flash enables "thinking" by default, and thinking tokens count against `maxOutputTokens` (was 1000) — leaving too few tokens for the JSON, which truncates.
- **Fix:** Disabled thinking for this structured-extraction task (`thinkingConfig: { thinkingBudget: 0 }`) and raised `maxOutputTokens` to 2048. Also made `JSON.parse` failures return a friendly "malformed response" message instead of a raw parser error.
