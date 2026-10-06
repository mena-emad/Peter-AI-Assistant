# API Reference

## Base URL

The application listens on `PORT` or `3000`; API routes are mounted under `/api/v1`. Configure `FRONTEND_URL` for the OAuth return URL and credentialed CORS origin. `GOOGLE_CALLBACK_URL` must exactly match the callback URI registered with Google.

## Authentication

OAuth uses HTTP-only cookies. The browser must send requests with credentials; access and refresh tokens are never returned to frontend JavaScript.

| Method | Route | Access | Behavior |
| --- | --- | --- | --- |
| `GET` | `/api/v1/auth/google` | Public | Starts Google OAuth and creates a short-lived OAuth state cookie. |
| `GET` | `/api/v1/auth/google/callback` | Google redirect | Validates OAuth state, creates or loads the user, sets access/refresh cookies, and redirects to `FRONTEND_URL`. |
| `GET` | `/api/v1/auth/me` | Access cookie | Returns the current public user profile. |
| `POST` | `/api/v1/auth/refresh` | Refresh cookie | Validates and rotates the stored refresh-token hash, then renews both cookies. |
| `POST` | `/api/v1/auth/logout` | Refresh cookie if present | Revokes the refresh session and clears auth and conversation cookies. |

`COOKIE_SAME_SITE` defaults to `lax`; use `none` only with HTTPS for cross-site deployments. `Secure` is enabled in production and whenever SameSite is `none`.

## Protected Chat

All chat routes require a valid `accessToken` cookie. The middleware also accepts bearer tokens for non-browser clients.

| Method | Route | Behavior |
| --- | --- | --- |
| `POST` | `/api/v1/chat` | Sends `{ "message": "..." }`; send `{ "newConversation": true }` to start a fresh conversation. Uses the `conversationId` HTTP-only cookie otherwise. Returns `{ "result", "conversationId" }` and updates the cookie. |
| `GET` | `/api/v1/chats` | Returns messages for the current cookie-selected conversation, or `[]` when none is active. Messages are scoped to the authenticated owner. |
| `POST` | `/api/v1/chats/active` | Accepts `{ "conversationId": "..." }`, verifies ownership, and updates the active conversation cookie. This supports selecting a saved conversation without putting its ID in a query string. |

New conversations are created implicitly by the first chat send. The conversation model stores the authenticated `userId`; history reads and sends verify that ownership.

## Errors

Unauthenticated or expired access requests return `401`. Invalid or unowned conversation selection returns `404`. Unhandled server errors use a generic JSON message without returning stack traces. The frontend may attempt one refresh-and-retry after a `401`.

The MCP tools below are internal tool callbacks, not HTTP endpoints.

## MCP Tools (Not HTTP)

### `search-verse-by-keyword`

Input schema: `{ "keyword": string }`. It searches `src/data/verses.json` by substring in `text` or `book`. Empty/whitespace input is rejected by `VersesService`; tool errors are returned as MCP content with `isError: true`.

### `search_bible_rag`

Input schema: `{ "keyword": string, "bookFilter?: string" }`. It creates a Gemini embedding, runs MongoDB Atlas `$vectorSearch` using index `vector-index`, returns at most three formatted chunks, and optionally filters by exact book name.