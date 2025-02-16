# Productivity Playlists

A task management app that helps you organize your daily activities into playlists. Built with Next.js, Capacitor, and SQLite.

## Features

- Create and manage task playlists
- Schedule playlists for specific days of the week
- Track task completion with a built-in timer
- View monthly statistics
- AI-powered task generation
- iOS app support via Capacitor

## Tech Stack

- Next.js 14
- Tailwind CSS
- Capacitor
- SQLite
- Prisma
- OpenAI API (for AI task generation)

## Prerequisites

- Node.js >= 18
- npm or yarn
- Xcode (for iOS development)
- CocoaPods
- PostgreSQL (for development)

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd productivity-playlists
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your database and OpenAI API credentials.

4. Initialize the database:
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Run the development server:
```bash
npm run dev
```

6. For iOS development:
```bash
npm run build
npx cap sync ios
npx cap open ios
```

## Environment Variables

Create a `.env` file with the following variables:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/productivity_app"
NEXT_PUBLIC_API_URL="http://localhost:3000"
PORT=3000
OPENAI_API_KEY="your-openai-api-key"
```

## Building for Production

1. Build the Next.js app:
```bash
npm run build
```

2. For iOS:
```bash
npx cap sync ios
```
Then open Xcode and build the project.

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 