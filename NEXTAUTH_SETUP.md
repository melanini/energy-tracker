# NextAuth.js Email Authentication Setup Guide

This guide provides complete instructions for setting up and troubleshooting NextAuth.js v4 with magic link email authentication in your EnergyFlow application.

## Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [Environment Variables](#environment-variables)
4. [Setting Up Gmail SMTP](#setting-up-gmail-smtp)
5. [Database Setup](#database-setup)
6. [Testing Authentication](#testing-authentication)
7. [Troubleshooting](#troubleshooting)
8. [Common Issues](#common-issues)

## Overview

The authentication system uses:
- **NextAuth.js v4** with JWT strategy (no database sessions)
- **Email Provider** for passwordless magic link authentication
- **Prisma Adapter** for user management
- **SMTP** via Gmail for sending magic links

## Installation

All required packages are already installed:
```bash
npm install next-auth@4.24.7 @next-auth/prisma-adapter@1.0.7 nodemailer@6.9.15 --legacy-peer-deps
npm install --save-dev @types/nodemailer
```

> **Note**: The `--legacy-peer-deps` flag is required because NextAuth v4 officially supports up to Next.js 14, but we're using Next.js 15.

## Environment Variables

### Required Variables

Create a `.env` file in your project root with the following variables:

```bash
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/energy_tracker"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-generated-secret-here"

# Email SMTP Configuration
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password-here"
EMAIL_FROM="noreply@yourdomain.com"
```

### Generating NEXTAUTH_SECRET

Generate a secure secret using one of these methods:

**Option 1: Using OpenSSL**
```bash
openssl rand -base64 32
```

**Option 2: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option 3: Online Generator**
Visit: https://generate-secret.vercel.app/32

Copy the generated value and paste it into your `.env` file:
```bash
NEXTAUTH_SECRET="your-generated-secret-here"
```

## Setting Up Gmail SMTP

To send magic link emails via Gmail, you need to create an **App Password**.

### Step-by-Step Instructions

1. **Enable 2-Factor Authentication**
   - Go to your Google Account: https://myaccount.google.com/
   - Navigate to **Security** → **2-Step Verification**
   - Follow the prompts to enable 2FA (required for App Passwords)

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select **Mail** as the app
   - Select **Other (Custom name)** as the device
   - Enter a name like "EnergyFlow App"
   - Click **Generate**
   - **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

3. **Update Environment Variables**
   ```bash
   EMAIL_SERVER_USER="your-email@gmail.com"
   EMAIL_SERVER_PASSWORD="abcd efgh ijkl mnop"  # Remove spaces when pasting
   EMAIL_FROM="your-email@gmail.com"
   ```

### Alternative SMTP Providers

If you prefer not to use Gmail, you can use other SMTP providers:

**SendGrid**
```bash
EMAIL_SERVER_HOST="smtp.sendgrid.net"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="apikey"
EMAIL_SERVER_PASSWORD="your-sendgrid-api-key"
```

**Mailgun**
```bash
EMAIL_SERVER_HOST="smtp.mailgun.org"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="postmaster@your-domain.mailgun.org"
EMAIL_SERVER_PASSWORD="your-mailgun-smtp-password"
```

**AWS SES**
```bash
EMAIL_SERVER_HOST="email-smtp.us-east-1.amazonaws.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-aws-access-key-id"
EMAIL_SERVER_PASSWORD="your-aws-secret-access-key"
```

## Database Setup

### 1. Update Prisma Schema

The Prisma schema has been updated with NextAuth models. Run these commands:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Optional: View your database in Prisma Studio
npx prisma studio
```

### 2. Verify Database Tables

After running `prisma db push`, you should see these new tables in your database:
- `Account`
- `Session`
- `User`
- `VerificationToken`

## Testing Authentication

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Test the Authentication Flow

1. Navigate to: http://localhost:3000/auth/signin
2. Enter your email address
3. Click "Continue with email"
4. Check your inbox for the magic link email
5. Click the link in the email to sign in
6. You should be redirected to: http://localhost:3000/home

### 3. Testing Protected Routes

The following routes are automatically protected by middleware:
- `/home` - Home dashboard
- `/track` - Time tracking page
- `/analytics` - Analytics page
- `/profile` - User profile

Try accessing these routes without signing in - you should be redirected to the sign-in page.

### 4. Sign Out

Navigate to `/profile` and click the "Sign Out" button at the bottom of the page.

## Troubleshooting

### Issue: Magic Link Not Working

**Symptoms:**
- Clicking the magic link shows an error
- "Verification token has expired or has already been used"

**Solutions:**

1. **Check the Link Timing**
   - Magic links expire after 24 hours
   - Each link can only be used once
   - Request a new link if expired

2. **Verify Database Connection**
   ```bash
   # Test database connection
   npx prisma db pull
   ```

3. **Check VerificationToken Table**
   ```bash
   # Open Prisma Studio
   npx prisma studio
   ```
   - Navigate to the `VerificationToken` table
   - Verify tokens are being created
   - Check the `expires` field

4. **Clear Old Tokens**
   ```bash
   # In Prisma Studio or your database client
   DELETE FROM "VerificationToken" WHERE expires < NOW();
   ```

### Issue: Email Not Being Sent

**Symptoms:**
- "Email sent" confirmation appears
- No email arrives in inbox or spam

**Solutions:**

1. **Verify SMTP Credentials**
   ```bash
   # Test SMTP connection with this Node.js script
   node -e "
   const nodemailer = require('nodemailer');
   const transporter = nodemailer.createTransport({
     host: 'smtp.gmail.com',
     port: 587,
     auth: {
       user: 'your-email@gmail.com',
       pass: 'your-app-password'
     }
   });
   transporter.verify((error, success) => {
     if (error) console.log('Error:', error);
     else console.log('SMTP Connection Successful!');
   });
   "
   ```

2. **Check Gmail Settings**
   - Verify 2FA is enabled
   - Regenerate App Password if needed
   - Check "Less secure app access" is OFF (App Passwords require this)

3. **Check Spam Folder**
   - Magic link emails may be marked as spam initially
   - Mark as "Not Spam" to whitelist

4. **Enable Debug Mode**
   
   In `src/app/api/auth/[...nextauth]/route.ts`, enable debug:
   ```typescript
   export const authOptions: NextAuthOptions = {
     // ... other options
     debug: true, // This will log detailed information to console
   };
   ```

### Issue: Redirect Not Working After Sign In

**Symptoms:**
- Successfully click magic link
- Page loads but doesn't redirect to `/home`

**Solutions:**

1. **Check NEXTAUTH_URL**
   ```bash
   # In .env, ensure this matches your development URL
   NEXTAUTH_URL="http://localhost:3000"
   ```

2. **Clear Browser Cookies**
   ```bash
   # In Chrome: Settings → Privacy → Clear browsing data
   # Select "Cookies and other site data"
   ```

3. **Check Middleware Configuration**
   
   Verify `src/middleware.ts` is correct:
   ```typescript
   export { default } from "next-auth/middleware";
   
   export const config = {
     matcher: ["/home", "/track", "/analytics", "/profile"],
   };
   ```

4. **Test with Different Browser**
   - Try in incognito mode
   - Try a different browser

### Issue: "Configuration Error"

**Symptoms:**
- Error page shows "There is a problem with the server configuration"

**Solutions:**

1. **Verify All Environment Variables**
   ```bash
   # Check .env file exists and has all required variables
   cat .env
   ```

2. **Restart Development Server**
   ```bash
   # Stop the server (Ctrl+C) and restart
   npm run dev
   ```

3. **Check NEXTAUTH_SECRET**
   ```bash
   # Ensure it's set and not empty
   echo $NEXTAUTH_SECRET
   ```

## Common Issues

### Session Not Persisting

**Problem:** User gets logged out on page refresh

**Solution:** 
- Check that JWT strategy is enabled (it is by default)
- Clear browser cookies and cache
- Verify `NEXTAUTH_SECRET` is set correctly

### Can't Access Protected Pages

**Problem:** Redirected to sign-in page even after signing in

**Solution:**
- Check middleware configuration in `src/middleware.ts`
- Verify session is being created (check browser DevTools → Application → Cookies)
- Look for cookie named `next-auth.session-token`

### TypeScript Errors

**Problem:** TypeScript complains about session.user.id

**Solution:**
- Ensure `next-auth.d.ts` exists in project root
- Restart TypeScript server in your editor
- Run: `npm run build` to check for type errors

### Database Connection Issues

**Problem:** "Can't reach database server" error

**Solution:**
```bash
# 1. Check if PostgreSQL is running
# macOS with Homebrew:
brew services list

# 2. Verify DATABASE_URL is correct
npx prisma db pull

# 3. Test connection
npx prisma studio
```

## Development vs Production

### Development Setup
```bash
NEXTAUTH_URL="http://localhost:3000"
```

### Production Setup
```bash
NEXTAUTH_URL="https://yourdomain.com"
# Don't forget to update allowed URLs in your SMTP provider
```

## Additional Resources

- **NextAuth.js Documentation**: https://next-auth.js.org/
- **Email Provider Docs**: https://next-auth.js.org/providers/email
- **JWT Strategy**: https://next-auth.js.org/configuration/nextauth-config#session
- **Prisma Adapter**: https://authjs.dev/reference/adapter/prisma

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use strong, random NEXTAUTH_SECRET** (minimum 32 characters)
3. **Enable HTTPS in production** (required for secure cookies)
4. **Rotate App Passwords** periodically
5. **Set up rate limiting** for magic link requests (consider Vercel Edge Config or Redis)
6. **Monitor failed login attempts** in production

## Next Steps

After successfully setting up authentication:

1. **Customize Email Template**: Edit the email content sent to users (see NextAuth email provider docs)
2. **Add User Profile Completion**: Create a page for users to complete their profile after first sign-in
3. **Implement User Roles**: Add role-based access control if needed
4. **Set Up Production SMTP**: Use a production-grade email service (SendGrid, AWS SES)
5. **Add Social Login**: Consider adding Google or Apple sign-in options

## Need Help?

If you're still experiencing issues:

1. Check the **NextAuth.js Discord**: https://discord.gg/bWXF8wk
2. Review **GitHub Issues**: https://github.com/nextauthjs/next-auth/issues
3. Check the **Prisma Documentation**: https://www.prisma.io/docs
4. Enable debug mode and check server logs

---

**Setup completed successfully!** 🎉

You now have a fully functional email authentication system with magic links. Users can sign up and sign in using only their email address - no passwords required!

