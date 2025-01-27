#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install dependencies
npm ci

# Generate Prisma Client
npx prisma generate

# Create database migrations
npx prisma migrate deploy

# Build Next.js app
npm run build
