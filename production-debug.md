Production debugging finding (2026-08-22):

- Login succeeds on the latest deployment.
- Dashboard loads at / and shows the Victory Tech™ watermark.
- POST /api/chat returns HTTP 500.
- Vercel runtime log error: `Gemini model "gpt-4-turbo-preview" was not found.`
- Root cause: the chat request is still passing the OpenAI default model name `gpt-4-turbo-preview` into the Gemini adapter. The adapter must map/ignore OpenAI model names and use a valid Gemini model such as `gemini-2.5-flash`.
- Latest deployment: E4j51VDzYFxHMK9YWmCNzBCjv9Rk, commit 29119ca.
- Test message used: `Please reply with exactly: Gemini connection test passed.`
- Production URL: https://lawliet-5ie2i5c1l-dspcarnage2s-projects.vercel.app
Follow-up verification (2026-08-22):

- Commit ae8fe66 deployed successfully as Vercel deployment Dy7xeuotd8PCVbadAnBXZPm23adu at https://lawliet-7mvvsbbjv-dspcarnage2s-projects.vercel.app.
- Authentication and redirect still work; dashboard loads and Victory Tech™ remains visible.
- A fresh production chat request still returned `❌ Error: HTTP 500`, so the model fallback fix did not fully resolve the runtime failure. The next step is to inspect the new deployment’s runtime log entry.
Final verification (2026-08-22):

- Commit 93f55e3 deployed as Vercel deployment CiaujaMuQR7cTifM3eDKED5i2nvq and reached Ready.
- The canonical alias https://lawliet-lilac.vercel.app resolves to the repaired authenticated dashboard.
- Login redirects to `/` successfully.
- The final test prompt `Reply with exactly: Gemini 3.6 is working.` completed successfully and appears in the conversation list without an error message.
- The dashboard and sign-in screen both display `Victory Tech™`.
- The confirmed account-supported model is `gemini-3.6-flash`; direct Gemini API generation also succeeded with the configured key.
Conversation continuity reproduction (2026-08-22):

After the successful Gemini reply, the canonical dashboard at https://lawliet-lilac.vercel.app loads with a blank `How can I help?` composer view on the right while the completed prompts remain listed in the left conversation history. This confirms the UI has returned to a new blank chat instead of keeping the replied-to conversation active.
