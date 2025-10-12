# Database Setup Guide

## 1. Create Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Click **"Create a project"**
3. Name it: `energy-tracker`
4. **IMPORTANT**: Select **PostgreSQL 17** as the version
5. Select your preferred region
6. Click **"Create project"**

> **Note**: Make sure to select PostgreSQL 17 when creating your Neon project to ensure full compatibility with the schema.

## 2. Get Connection String

1. In your Neon project dashboard, click **"Connection Details"**
2. From the dropdown, select **"Prisma"**
3. Copy the connection string (it will look like this):
   ```
   DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
   ```

## 3. Add to Your Project

1. Create a `.env` file in the root of your project:
   ```bash
   touch .env
   ```

2. Open `.env` and paste your connection string:
   ```env
   DATABASE_URL="postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"
   ```

## 4. Run Migrations

Run the following commands to create your database tables:

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

## Database Schema Overview

Your database includes the following tables:

### Core Tables
- **users** - User accounts with email, timezone, consents
- **devices** - User devices for tracking data sources
- **check_ins** - Daily energy check-ins (physical, cognitive, mood, stress)
- **tags** - Custom tags for categorizing activities/inputs
- **check_in_tags** - Many-to-many relation between check-ins and tags

### Well-being Features
- **happy_moments** - Positive moments logging
- **pomodoro_sessions** - Focus session tracking

### Integrations
- **integrations** - Connected services (Oura, Whoop, etc.)
- **wearable_imports** - Data from wearable devices
- **calendar_connections** - Calendar API connections
- **calendar_calendars** - Individual calendars from connections
- **calendar_events_imported** - Events from connected calendars

### Time & Analytics
- **time_spent_blocks** - Time categorization and tracking
- **insights** - System-generated pattern insights
- **ai_insights** - AI-powered recommendations

### Gamification & Subscriptions
- **achievements** - User achievements and milestones
- **subscriptions** - User subscription plans
- **audit_log** - Activity audit trail

## Using Prisma in Your Code

Import the Prisma client in your API routes or server components:

```typescript
import { prisma } from '@/lib/prisma'

// Example: Create a user
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    timezone: 'America/New_York',
  },
})

// Example: Create a check-in
const checkIn = await prisma.checkIn.create({
  data: {
    userId: user.id,
    window: 'morning',
    tsLocal: new Date(),
    tsUtc: new Date(),
    physical17: 5,
    cognitive17: 6,
    mood17: 7,
    stress17: 3,
  },
})
```

## Helpful Commands

```bash
# Generate Prisma Client after schema changes
npx prisma generate

# Create a new migration
npx prisma migrate dev --name descriptive_name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio

# Format schema file
npx prisma format
```

## Notes

- The schema uses `@default(cuid())` for IDs - these are URL-safe, collision-resistant identifiers
- Timestamps use both local and UTC where relevant for accurate time tracking
- Privacy-conscious design with hashed titles for calendar events
- Cascade deletes configured - when a user is deleted, all their data is removed
- All relations are properly indexed for performance

