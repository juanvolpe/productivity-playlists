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
- OpenAI API (for AI task generation)

## Prerequisites

- Node.js >= 18
- npm or yarn
- Xcode (for iOS development)
- CocoaPods

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
Edit `.env` with your OpenAI API key and other configurations.

4. Run the development server:
```bash
npm run dev
```

5. For iOS development:
```bash
# Build and sync with iOS
npm run ios:sync

# Open in Xcode
npm run ios:open
```

## Environment Variables

Create a `.env` file with the following variables:

```env
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
npm run ios:sync
```
Then open Xcode and build the project.

## iOS Development Notes

- Make sure you have Xcode installed and updated
- Install CocoaPods if you haven't already: `sudo gem install cocoapods`
- After running `npm run ios:sync`, open the project in Xcode using `npm run ios:open`
- In Xcode, select your team and update the bundle identifier if needed
- Build and run the project in Xcode

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 