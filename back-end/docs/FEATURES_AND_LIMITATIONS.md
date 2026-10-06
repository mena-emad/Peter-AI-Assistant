# Features and Limitations

## Implemented

- Google OAuth login with state validation and HTTP-only access/refresh cookies.
- Current-user, refresh-token rotation, and logout endpoints.
- Authentication middleware protecting model, history, and conversation selection routes.
- Conversation ownership checks tied to the authenticated user.
- HTTP chat/history routes: `POST /api/v1/chat`, `GET /api/v1/chats`, and `POST /api/v1/chats/active`.
- Implicit conversation creation and continuation via an HTTP-only `conversationId` cookie.
- MongoDB persistence for conversations and chat messages.
- Gemini chat generation using `gemini-3.5-flash-lite`.
- Gemini function calling with `search-verse-by-keyword` and `search_bible_rag`.
- Local keyword search over three records in `src/data/verses.json`.
- Embedding-based MongoDB vector search over `Chunk` documents.
- Seed script that chunks Genesis sample data and creates embeddings.
- Long-term summaries generated after 20 new stored messages.
- MCP stdio server exposing the two Bible tools.

## Partially Implemented or Fragile

- Conversation continuity exists, but persisted model messages use `model` while Gemini history reconstruction checks for `assistant`, causing model rows to be replayed as user rows.
- History sorting uses `createdAt`, but `ChatHistory` does not enable timestamps.
- Summary generation exists but runs synchronously inside chat requests and can fail an otherwise persisted response.
- Prompt-based religious retrieval routing is requested by the system prompt but is not enforced by server code.
- Vector retrieval exists in code but requires external Atlas vector index configuration and seeded chunks not verified by this repository.
- The service supports an array-result normalization branch, but that branch returns a bare string without the conversation ID expected by the controller.
- MCP and HTTP startup share one process, and the tool/container import cycle is fragile.
- `express` is used but not declared as a direct package dependency.

## Missing or Not Established

- Server-side endpoint to list all conversations; the current frontend sidebar index is browser-local and account-scoped.
- Conversation detail/rename/delete endpoints.
- Direct HTTP verse-search endpoint.
- Standard error response format and centralized error middleware.
- Request validation for message type, emptiness, length, or content.
- Cross-site cookie deployments require `COOKIE_SAME_SITE=none`, HTTPS, and a matching `FRONTEND_URL`.
- Application rate limiting, despite `express-rate-limit` appearing transitively in the lockfile.
- Streaming responses, partial tokens, or server-sent events.
- Provider fallback, retries, timeouts, circuit breakers, or graceful shutdown.
- Atlas vector index dimensions, similarity metric, and deployment configuration.
- A documented public base URL or frontend environment contract.
- Automated tests; `npm test` is a placeholder that exits with an error.

## Security and Operational Risks

- The conversation cookie is unsigned and client-controlled. Without authentication or ownership checks, any valid conversation ID can be used to access or append to that conversation.
- Application logs include message content, tool names, tool results, and full Gemini response objects.
- The repository contains an `.env` file. Its values are intentionally not documented; credentials should be rotated if they have ever been committed or exposed.
- No explicit JSON body-size limit is configured.
- MongoDB and MCP resources are not gracefully closed on shutdown.
- The summary and retrieved content are placed into model context. The prompt labels summaries as memory, but no independent trust boundary or content sanitization is implemented.

## Explicitly Planned Features

No future feature roadmap or planned functionality was found in the inspected source files. Any UI feature beyond the single chat submission flow should be treated as frontend design work requiring a backend contract that does not currently exist.

## Source of Truth

The implementation details in this document set are based on the current files under `back-end/src`, `back-end/index.js`, `back-end/container.js`, and `back-end/package.json`. See [API](./API.md), [Database](./DATABASE.md), and [AI System](./AI_SYSTEM.md) for the detailed contracts and flows.
