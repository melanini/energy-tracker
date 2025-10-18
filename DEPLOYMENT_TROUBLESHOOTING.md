# Clerk Authentication Error Troubleshooting Guide

## Error: "Authentication Error: There is a problem with the server configuration"

This error occurs when Clerk cannot properly initialize due to missing or incorrect configuration in production.

## **CRITICAL: Required Environment Variables**

Your production deployment **MUST** have these environment variables set:

### 1. **NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY** (CRITICAL)
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_your-publishable-key-here"
```
- Get from your Clerk dashboard → API Keys
- Use `pk_live_` for production, `pk_test_` for development
- Must be publicly accessible

### 2. **CLERK_SECRET_KEY** (CRITICAL)
```bash
CLERK_SECRET_KEY="sk_live_your-secret-key-here"
```
- Get from your Clerk dashboard → API Keys
- Use `sk_live_` for production, `sk_test_` for development
- Keep this secret and never expose it publicly

### 3. **DATABASE_URL** (CRITICAL)
```bash
DATABASE_URL="postgresql://user:password@host:5432/database_name"
```
- Must be accessible from your production environment
- Test connection before deployment

### 4. **Optional: Custom URLs**
```bash
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/auth/signin"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/auth/signup"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/home"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/home"
```

## **Step-by-Step Fix**

### Step 1: Verify Environment Variables
Check your deployment platform (Vercel, Netlify, etc.) and ensure ALL required variables are set:

1. Go to your deployment dashboard
2. Navigate to Environment Variables section
3. Verify these are set:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `DATABASE_URL`

### Step 2: Get Clerk API Keys
If missing, get your keys from Clerk:

1. Go to [clerk.com](https://clerk.com) and sign in
2. Select your application
3. Go to "API Keys" in the sidebar
4. Copy your **Publishable Key** and **Secret Key**
5. Add them to your deployment environment

### Step 3: Use Correct Key Types
Make sure you're using the right keys for your environment:
```bash
# For development:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# For production:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
```

### Step 4: Test Database Connection
Verify your database is accessible:
```bash
# Test connection (run locally with production DATABASE_URL)
npx prisma db pull
```

### Step 5: Redeploy
After setting environment variables:
1. Trigger a new deployment
2. Wait for build to complete
3. Test authentication

## **Common Deployment Platform Issues**

### Vercel
- Environment variables are set in Project Settings → Environment Variables
- Make sure to set for "Production" environment
- Redeploy after adding variables

### Netlify
- Environment variables are in Site Settings → Environment Variables
- Redeploy after adding variables

### Railway/Render
- Environment variables in project settings
- Restart service after adding variables

## **Debugging Steps**

### 1. Enable Debug Mode (Temporarily)
In your `src/lib/auth.ts`, temporarily change:
```typescript
debug: true, // Enable debug logging
```

### 2. Check Build Logs
Look for errors during the build process that might indicate missing environment variables.

### 3. Test Environment Variables
Add a temporary API route to check if variables are loaded:
```typescript
// src/app/api/debug-env/route.ts
export async function GET() {
  return Response.json({
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nextAuthUrl: process.env.NEXTAUTH_URL,
  });
}
```

## **Google OAuth Setup**

If using Google sign-in, ensure:

1. **Google Cloud Console Setup**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create/select a project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `https://yourdomain.com/api/auth/callback/google`

2. **Environment Variables**:
   ```bash
   GOOGLE_CLIENT_ID="your-client-id"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

## **Database Issues**

### Prisma Adapter Problems
If you're getting database-related errors:

1. **Check Database Connection**:
   ```bash
   npx prisma db pull
   ```

2. **Run Migrations**:
   ```bash
   npx prisma db push
   ```

3. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

### Connection Pool Issues
If using a connection pooler, ensure your `DATABASE_URL` includes:
```bash
DATABASE_URL="postgresql://user:password@host:5432/db?connection_limit=1"
```

## **Quick Checklist**

- [ ] `NEXTAUTH_URL` is set to your exact production domain with HTTPS
- [ ] `NEXTAUTH_SECRET` is set and is at least 32 characters
- [ ] `DATABASE_URL` is accessible from production
- [ ] Google OAuth credentials are set (if using Google)
- [ ] Environment variables are set for "Production" environment
- [ ] App has been redeployed after setting variables
- [ ] Database tables exist (run `npx prisma db push`)

## **Still Having Issues?**

1. **Check the exact error message** in your browser's developer console
2. **Look at server logs** in your deployment platform
3. **Test locally** with production environment variables
4. **Verify all environment variables** are actually set (not just in your local .env)

## **Emergency Fix**

If you need to get authentication working quickly:

1. **Remove Prisma Adapter temporarily**:
   ```typescript
   // In src/lib/auth.ts, comment out:
   // adapter: PrismaAdapter(prisma),
   ```

2. **Use JWT-only strategy** (already configured)
3. **Set minimal environment variables**:
   ```bash
   NEXTAUTH_URL="https://yourdomain.com"
   NEXTAUTH_SECRET="your-secret"
   ```

This will get authentication working, but you'll lose user persistence. Add the database back once the basic auth is working.
