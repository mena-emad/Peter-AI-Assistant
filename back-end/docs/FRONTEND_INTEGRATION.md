# Frontend Integration Guide

## Authentication

Use the configured API base URL and one credentialed Axios client (`withCredentials: true`). Start Google sign-in by navigating to `GET /api/v1/auth/google`; do not post credentials or store access/refresh tokens in browser storage. The backend returns to `FRONTEND_URL` with HTTP-only cookies set.

On app startup, call `GET /api/v1/auth/me`. Keep the chat tree unmounted while this check is pending. If it returns `401`, the client attempts `POST /api/v1/auth/refresh` once and retries the original request. If refresh fails, clear in-memory auth state and show the Google login page. `POST /api/v1/auth/logout` revokes the refresh session and clears authentication/conversation cookies.

## Chat Requests

All `/chat` and `/chats` routes require the access cookie. The browser sends it automatically through the shared Axios instance.

- `POST /api/v1/chat` sends `{ "message": "..." }`; success returns `{ "result": "...", "conversationId": "..." }`.
- The active conversation ID is kept in an HTTP-only cookie and is not sent as a query parameter.
- For a user-requested new chat, send `{ "message": "...", "newConversation": true }` once; the backend creates a conversation and sets its cookie.
- `GET /api/v1/chats` reads history for the cookie-selected conversation.
- To select a known saved conversation, `POST /api/v1/chats/active` with its ID in the JSON body; the backend verifies ownership and updates the HTTP-only cookie before the normal history GET.

History records are returned newest-first with `role` values `user` and `model`; map `model` to `assistant` and render in chronological order. The frontend sidebar index stores only IDs/titles per signed-in user; transcript content remains server-side. No server endpoint currently lists every conversation, so a new browser cannot discover old conversations not previously indexed there.

## Deployment

Set `GOOGLE_CALLBACK_URL` to the exact Google OAuth callback (`/api/v1/auth/google/callback`) and register that URI in Google Cloud. Set `FRONTEND_URL` to the frontend origin for OAuth return redirects and credentialed CORS. For a cross-site frontend/API deployment, set `COOKIE_SAME_SITE=none` and use HTTPS; the default is `lax`.

The API returns generic JSON errors; the frontend should show friendly text and never render backend stack traces. A `401` from a chat request must stop the message operation and return the user to the login gate if refresh fails.

Bible retrieval output is folded into the model's final text. Vector retrieval still depends on separately seeded MongoDB chunks and a configured Atlas vector index.