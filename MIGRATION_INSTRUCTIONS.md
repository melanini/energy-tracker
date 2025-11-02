# Database Migration Instructions

## Overview
The following database schema changes have been made to support missing API endpoints:

### New Models Added:
1. **CustomTracker** - Stores user-defined custom trackers (e.g., water intake, steps)
2. **CustomTrackerValue** - Stores historical values for custom trackers
3. **SleepHygiene** - Stores sleep hygiene data associated with check-ins
4. **CheckInCustomTrackerValue** - Links custom tracker values to specific check-ins

### Updated Models:
1. **User** - Added `customTrackers` relation
2. **CheckIn** - Added `sleepHygiene` and `customTrackerValues` relations

## Migration Steps

### 1. Generate Prisma Client
Run this command to regenerate the Prisma client with the new schema:

```bash
npx prisma generate
```

### 2. Create and Apply Migration
Create a migration for the schema changes:

```bash
npx prisma migrate dev --name add_custom_trackers_and_sleep_hygiene
```

This will:
- Create a new migration file in `prisma/migrations/`
- Apply the migration to your development database
- Regenerate the Prisma client

### 3. For Production Deployment
When deploying to production, run:

```bash
npx prisma migrate deploy
```

## New API Endpoints Created

### 1. Custom Trackers
- ✅ `GET /api/custom-trackers` - Fetch all custom trackers for user
- ✅ `POST /api/custom-trackers` - Create new custom tracker
- ✅ `GET /api/custom-trackers/[id]` - Get specific tracker with values
- ✅ `PUT /api/custom-trackers/[id]` - Update custom tracker
- ✅ `PATCH /api/custom-trackers/[id]` - Partially update custom tracker
- ✅ `DELETE /api/custom-trackers/[id]` - Delete custom tracker

### 2. Happy Moments
- ✅ `DELETE /api/happy-moments/[id]` - Delete specific happy moment
- ✅ `GET /api/happy-moments/[id]` - Get specific happy moment
- ✅ `PUT /api/happy-moments/[id]` - Update happy moment

### 3. Check-ins (Updated)
- ✅ Enhanced `POST /api/check-ins` to handle:
  - `sleepHygiene` object
  - `customTrackers` array with values
- ✅ Enhanced `GET /api/check-ins` to return:
  - Sleep hygiene data
  - Custom tracker values

### 4. Pomodoro (Fixed)
- ✅ Fixed parameter naming: now accepts both `durationMin` (new) and `duration` (legacy)

## Database Schema Details

### CustomTracker Table
```prisma
model CustomTracker {
  id        String   @id @default(cuid())
  userId    String
  label     String
  icon      String
  unit      String
  unitType  String   // "number" | "scale" | "boolean" | "string"
  maxValue  Int?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  values    CustomTrackerValue[]
}
```

### SleepHygiene Table
```prisma
model SleepHygiene {
  id                  String   @id @default(cuid())
  checkInId           String   @unique
  consistentSchedule  Boolean  @default(false)
  noScreens           Boolean  @default(false)
  relaxingRoutine     Boolean  @default(false)
  optimalEnvironment  Boolean  @default(false)
  noCaffeine          Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  checkIn             CheckIn  @relation(fields: [checkInId], references: [id], onDelete: Cascade)
}
```

### CheckInCustomTrackerValue Table
```prisma
model CheckInCustomTrackerValue {
  id         String   @id @default(cuid())
  checkInId  String
  trackerId  String
  value      String   // Store all types as string for flexibility
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  checkIn    CheckIn  @relation(fields: [checkInId], references: [id], onDelete: Cascade)
}
```

## Testing

After running the migration, test the new endpoints:

1. **Create a custom tracker:**
```bash
curl -X POST http://localhost:3000/api/custom-trackers \
  -H "Content-Type: application/json" \
  -d '{"label":"Water Intake","icon":"💧","unit":"glasses","unitType":"number","maxValue":10}'
```

2. **Create a check-in with sleep hygiene:**
```bash
curl -X POST http://localhost:3000/api/check-ins \
  -H "Content-Type: application/json" \
  -d '{
    "window":"morning",
    "physical17":5,
    "cognitive17":6,
    "note":"Test",
    "sleepHygiene":{"consistentSchedule":true,"noScreens":true}
  }'
```

3. **Delete a happy moment:**
```bash
curl -X DELETE http://localhost:3000/api/happy-moments/[moment-id]
```

## Rollback

If you need to rollback the migration:

```bash
npx prisma migrate resolve --rolled-back [migration-name]
```

Then manually revert the schema changes in `prisma/schema.prisma`.

## Notes

- All new endpoints require authentication (Clerk)
- Custom tracker values are stored as strings for flexibility
- Sleep hygiene is optional on check-ins
- The Prisma client linting errors will resolve once you run `npx prisma generate`

