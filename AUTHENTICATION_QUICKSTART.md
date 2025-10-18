# NextAuth Email Authentication - Quick Start

This quick start guide will get your authentication system up and running in 5 minutes.

## Prerequisites

- PostgreSQL database running
- Gmail account with 2FA enabled

## Step 1: Set Up Environment Variables

1. Copy the `.env.example` file:
   ```bash
   cp .env.example .env
   ```

2. Generate a NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

3. Update your `.env` file with these values:
   ```bash
   # Database (update with your credentials)
   DATABASE_URL="postgresql://user:password@localhost:5432/energy_tracker"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="paste-generated-secret-here"

   # Email SMTP (Gmail)
   EMAIL_SERVER_HOST="smtp.gmail.com"
   EMAIL_SERVER_PORT="587"
   EMAIL_SERVER_USER="your-email@gmail.com"
   EMAIL_SERVER_PASSWORD="your-app-password"  # See Step 2
   EMAIL_FROM="your-email@gmail.com"
   ```

## Step 2: Get Gmail App Password

1. **Enable 2-Factor Authentication** (if not already enabled):
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification" and follow the setup

2. **Generate App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Ryze"
   - Click "Generate"
   - **Copy the 16-character password** (remove spaces)
   - Paste it into `EMAIL_SERVER_PASSWORD` in your `.env` file

## Step 3: Set Up Database

Run these commands to create the required database tables:

```bash
# Generate Prisma Client
npx prisma generate

# Create/update database tables
npx prisma db push

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

## Step 4: Start the Application

```bash
npm run dev
```

Your app should now be running at http://localhost:3000

## Step 5: Test Authentication

1. Navigate to: http://localhost:3000/auth/signin
2. Enter your email address
3. Check your inbox for the magic link
4. Click the link to sign in
5. You'll be redirected to: http://localhost:3000/home

**That's it!** 🎉 Your authentication is now working.

## Protected Routes

These pages require authentication:
- `/home` - Dashboard
- `/track` - Time tracking
- `/analytics` - Analytics
- `/profile` - User profile (includes Sign Out button)

## Troubleshooting

### "Email not sent"
- Verify your Gmail App Password is correct (no spaces)
- Check that 2FA is enabled on your Google account
- Look in your spam folder

### "Magic link doesn't work"
- Links expire after 24 hours
- Each link can only be used once
- Request a new link if needed

### "Configuration error"
- Ensure all environment variables are set
- Restart the dev server: Stop (Ctrl+C) and run `npm run dev` again

### "Can't connect to database"
- Verify PostgreSQL is running
- Check `DATABASE_URL` is correct
- Run `npx prisma db pull` to test connection

## Complete Documentation

For detailed setup instructions, troubleshooting, and advanced configuration, see:
- [NEXTAUTH_SETUP.md](./NEXTAUTH_SETUP.md) - Complete setup guide

## Commands Reference

```bash
# Generate Prisma Client
npx prisma generate

# Push database schema changes
npx prisma db push

# View database in Prisma Studio
npx prisma studio

# Start development server
npm run dev

# Generate NextAuth secret
openssl rand -base64 32
```

## What Was Implemented

✅ NextAuth.js v4 with JWT strategy  
✅ Email provider with magic link authentication  
✅ Prisma adapter for user management  
✅ Protected routes with middleware  
✅ Beautiful sign-in/sign-up pages with shadcn UI  
✅ Session management on all pages  
✅ Sign out functionality  
✅ TypeScript type definitions  
✅ Error handling and loading states  

## File Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # NextAuth configuration
│   ├── auth/
│   │   ├── signin/
│   │   │   └── page.tsx             # Sign in page
│   │   ├── signup/
│   │   │   └── page.tsx             # Sign up page
│   │   ├── verify-request/
│   │   │   └── page.tsx             # Email sent confirmation
│   │   └── error/
│   │       └── page.tsx             # Error page
│   ├── layout.tsx                   # Root layout with SessionProvider
│   └── home/
│       └── page.tsx                 # Protected home page
├── components/
│   └── providers/
│       └── SessionProvider.tsx      # Client-side session provider
├── middleware.ts                    # Route protection
└── next-auth.d.ts                   # TypeScript type extensions

prisma/
└── schema.prisma                    # Database schema with NextAuth models
```

## Environment Variables

All required environment variables are documented in `.env.example`. Make sure to create a `.env` file with your actual values.

**Never commit your `.env` file to version control!**

---

Need help? See [NEXTAUTH_SETUP.md](./NEXTAUTH_SETUP.md) for detailed troubleshooting.

