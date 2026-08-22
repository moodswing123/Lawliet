Production debugging finding (2026-08-22):

- Login succeeds on the latest deployment.
- Dashboard loads at / and shows the Victory Tech™ watermark.
- POST /api/chat returns HTTP 500.
- Vercel runtime log error: `Gemini model "gpt-4-turbo-preview" was not found.`
- Root cause: the chat request is still passing the OpenAI default model name `gpt-4-turbo-preview` into the Gemini adapter. The adapter must map/ignore OpenAI model names and use a valid Gemini model such as `gemini-2.5-flash`.
- Latest deployment: E4j51VDzYFxHMK9YWmCNzBCjv9Rk, commit 29119ca.
- Test message used: `Please reply with exactly: Gemini connection test passed.`
- Production URL: https://lawliet-5ie2i5c1l-dspcarnage2s-projects.vercel.app
