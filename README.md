# Post Pilot AI Client

Frontend for Post Pilot AI built with Next.js 16.2.6 and React.

## Live Links

- Live frontend: https://post-pilot-ai-client-2.vercel.app
- API backend: https://post-pilot-ai-server-2.vercel.app/api/v1

## Features

- User registration and login
- JWT-based auth with token storage in localStorage
- AI post generation via backend `/ai/generate`
- Saved posts page for the current user
- Responsive UI using @heroui/react components
- Next.js app router structure

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=https://post-pilot-ai-server-2.vercel.app/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

> For local development, set `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1` if the backend runs locally.

3. Run the app:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
npm start
```

## API Integration

The frontend uses `src/lib/api.ts` to call the backend.

- `authAPI.register` → `/auth/register`
- `authAPI.login` → `/auth/login`
- `authAPI.getUser` → `/auth/me`
- `postsAPI.create` → `/posts`
- `postsAPI.getMine` → `/posts/my`
- `aiAPI.generate` → `/ai/generate`

## Auth Flow

- User signs up at `/register`
- User logs in at `/login`
- Auth token is stored in `localStorage`
- Protected user profile and saved posts use the token in `Authorization: Bearer <token>` headers

## Notes

- The `auth-context` provider loads current user data on page load if a token exists.
- The `my-posts` page displays saved posts for the logged-in user.
- Google sign-in is included in UI but requires `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and backend support.

## Scripts

- `npm run dev` — start development server
- `npm run build` — build production app
- `npm run start` — start production server
- `npm run lint` — lint codebase
