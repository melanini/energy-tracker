# Next Steps - Quick Start Guide

## 🚨 Important: Run These Commands

After implementing all the missing endpoints, you need to update your database schema and regenerate the Prisma client.

---

## Step 1: Generate Prisma Client

This will update TypeScript types and fix linting errors:

```bash
npx prisma generate
```

**Expected Output:**
```
✔ Generated Prisma Client
```

---

## Step 2: Create & Apply Database Migration

This will create the new tables and relationships:

```bash
npx prisma migrate dev --name add_custom_trackers_and_sleep_hygiene
```

**What this does:**
- Creates a new migration file
- Creates 4 new tables: `CustomTracker`, `CustomTrackerValue`, `SleepHygiene`, `CheckInCustomTrackerValue`
- Updates `User` and `CheckIn` tables with new relations
- Applies changes to your database

**Expected Output:**
```
✔ Applying migration...
✔ Your database is now in sync with your schema
```

---

## Step 3: Restart Development Server

```bash
npm run dev
```

---

## Step 4: Test the New Endpoints

### Test 1: Create a Custom Tracker

Open your browser console on `http://localhost:3000` and run:

```javascript
fetch('/api/custom-trackers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    label: 'Water Intake',
    icon: '💧',
    unit: 'glasses',
    unitType: 'number',
    maxValue: 10
  })
})
.then(r => r.json())
.then(console.log);
```

### Test 2: Get Custom Trackers

```javascript
fetch('/api/custom-trackers')
  .then(r => r.json())
  .then(console.log);
```

### Test 3: Create Check-in with Sleep Hygiene

```javascript
fetch('/api/check-ins', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    window: 'morning',
    physical17: 5,
    cognitive17: 6,
    note: 'Test check-in',
    sleepHygiene: {
      consistentSchedule: true,
      noScreens: true,
      relaxingRoutine: false,
      optimalEnvironment: true,
      noCaffeine: true
    }
  })
})
.then(r => r.json())
.then(console.log);
```

---

## ⚠️ Troubleshooting

### Issue: "sleepHygiene does not exist in type"
**Solution:** Run `npx prisma generate` again

### Issue: Migration fails with "relation already exists"
**Solution:** 
1. Check existing migrations: `ls prisma/migrations`
2. If duplicate, delete and retry
3. Or use: `npx prisma migrate resolve --rolled-back [migration-name]`

### Issue: Database connection error
**Solution:**
1. Check if PostgreSQL is running
2. Verify `DATABASE_URL` in `.env`
3. If using Docker: `docker-compose up -d`

### Issue: Authentication errors (401)
**Solution:**
1. Make sure you're logged in via Clerk
2. Check Clerk credentials in `.env`
3. Clear browser cookies and re-login

---

## 📋 What Was Implemented

### New API Endpoints (9 total):
1. ✅ `GET /api/custom-trackers` - List user's custom trackers
2. ✅ `POST /api/custom-trackers` - Create custom tracker
3. ✅ `GET /api/custom-trackers/[id]` - Get tracker details
4. ✅ `PUT /api/custom-trackers/[id]` - Update tracker
5. ✅ `PATCH /api/custom-trackers/[id]` - Partial update
6. ✅ `DELETE /api/custom-trackers/[id]` - Delete tracker
7. ✅ `DELETE /api/happy-moments/[id]` - Delete happy moment
8. ✅ `GET /api/happy-moments/[id]` - Get happy moment
9. ✅ `PUT /api/happy-moments/[id]` - Update happy moment

### Enhanced Endpoints:
- ✅ `POST /api/check-ins` - Now accepts `sleepHygiene` and `customTrackers`
- ✅ `GET /api/check-ins` - Now returns `sleepHygiene` and `customTrackerValues`
- ✅ `POST /api/pomodoro` - Fixed parameter naming (`durationMin`)

### New Database Tables:
1. `CustomTracker` - User-defined tracking metrics
2. `CustomTrackerValue` - Historical values for trackers
3. `SleepHygiene` - Sleep hygiene checklist data
4. `CheckInCustomTrackerValue` - Links trackers to check-ins

---

## 🎉 After Migration

Once the migration is complete, your app will have full support for:

- ✅ **Custom Trackers**: Users can create their own metrics (water, steps, mood, etc.)
- ✅ **Sleep Hygiene Tracking**: Track sleep habits alongside energy levels
- ✅ **Happy Moments Management**: Full CRUD operations on happy moments
- ✅ **Enhanced Check-ins**: Store comprehensive daily data

---

## 📚 Documentation

For more details, see:
- `ENDPOINT_FIXES_SUMMARY.md` - Complete API documentation
- `MIGRATION_INSTRUCTIONS.md` - Database migration details
- `prisma/schema.prisma` - Updated database schema

---

## 🔄 Rolling Back (If Needed)

If something goes wrong and you need to rollback:

```bash
# 1. Mark migration as rolled back
npx prisma migrate resolve --rolled-back add_custom_trackers_and_sleep_hygiene

# 2. Revert schema.prisma changes manually
git checkout prisma/schema.prisma

# 3. Regenerate client
npx prisma generate

# 4. Restart server
npm run dev
```

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] Prisma client generated successfully
- [ ] Migration applied without errors
- [ ] Development server starts without TypeScript errors
- [ ] Can create custom trackers via API
- [ ] Can submit check-ins with sleep hygiene data
- [ ] Can delete happy moments
- [ ] Track page loads and shows custom tracker fields
- [ ] All existing features still work

---

## 🚀 Ready for Production?

Before deploying to production:

1. ✅ Test all endpoints locally
2. ✅ Run test suite: `npm test`
3. ✅ Check for console errors
4. ✅ Verify database backup exists
5. ✅ Review migration file
6. 🚀 Deploy with: `npx prisma migrate deploy`

---

**Need Help?** Check the logs:
- Server logs: Check terminal running `npm run dev`
- Browser console: F12 → Console tab
- Database logs: Check PostgreSQL logs or Docker logs

