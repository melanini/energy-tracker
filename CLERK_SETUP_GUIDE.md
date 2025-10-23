# Clerk Authentication Setup Guide

This guide will help you set up Clerk authentication for your Ryze application, replacing the previous NextAuth setup.

## What Changed

✅ **Removed**: NextAuth.js with magic link email authentication  
✅ **Added**: Clerk with email, Google, and Apple sign-in options  
✅ **Simplified**: No more complex environment variables or SMTP setup  
✅ **Enhanced**: Better user management and authentication flows  

## Step 1: Create Clerk Account

1. Go to [clerk.com](https://clerk.com) and sign up for a free account
2. Create a new application
3. Choose "Next.js" as your framework
4. Note down your API keys from the dashboard

## Step 2: Set Up Environment Variables

Create a `.env.local` file in your project root with these variables:

```bash
# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your-publishable-key-here"
CLERK_SECRET_KEY="sk_test_your-secret-key-here"

# Optional: Custom URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/auth/signin"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/auth/signup"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/home"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/home"

# Database (keep your existing database)
DATABASE_URL="postgresql://user:password@localhost:5432/energy_tracker"

# Optional: OpenAI (if using AI features)
OPENAI_API_KEY="your-openai-api-key"
NEXT_PUBLIC_APP_ENV="development"
```

## Step 3: Configure Authentication Providers

In your Clerk dashboard:

1. **Go to "User & Authentication" → "Social Connections"**
2. **Enable Google OAuth**:
   - Click "Add Google"
   - Follow the setup instructions
   - You'll need to create a Google Cloud Console project
   - See `CLERK_OAUTH_SETUP.md` for detailed Google OAuth configuration
3. **Enable Apple Sign-In**:
   - Click "Add Apple"
   - Follow the setup instructions
   - You'll need an Apple Developer account
   - See `CLERK_OAUTH_SETUP.md` for detailed Apple Sign-In configuration
4. **Configure Email Authentication**:
   - Go to "Email, Phone, Username"
   - Enable "Email address" as a sign-in method
   - Configure email templates if desired

> **Note**: For detailed OAuth setup instructions, see the `CLERK_OAUTH_SETUP.md` file which provides step-by-step guides for configuring Google and Apple sign-in.

## Step 4: Test the Setup

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test the authentication flow**:
   - Go to `http://localhost:3000/auth/signin`
   - Try signing in with email, Google, or Apple
   - Verify you're redirected to `/home` after successful authentication

3. **Test protected routes**:
   - Try accessing `/home`, `/track`, `/analytics`, or `/profile` without signing in
   - You should be redirected to the sign-in page

## Step 5: Production Deployment

### Environment Variables for Production

Set these in your deployment platform (Vercel, Netlify, etc.):

```bash
# Clerk (use live keys for production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_your-production-key"
CLERK_SECRET_KEY="sk_live_your-production-secret"

# Custom URLs for production
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/auth/signin"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/auth/signup"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/home"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/home"

# Database
DATABASE_URL="your-production-database-url"
```

### Update Clerk Dashboard

1. **Add your production domain** to allowed origins in Clerk dashboard
2. **Update OAuth redirect URLs** for Google and Apple to include your production domain
3. **Test authentication** on your production site

## Features Included

### ✅ Authentication Methods
- **Email/Password**: Traditional email and password sign-in
- **Google OAuth**: Sign in with Google account
- **Apple Sign-In**: Sign in with Apple ID
- **Magic Links**: Passwordless email authentication (optional)

### ✅ User Management
- **User Profiles**: Automatic profile creation and management
- **Session Management**: Secure session handling
- **Account Linking**: Connect multiple authentication methods
- **Password Reset**: Built-in password reset functionality

### ✅ Security Features
- **JWT Tokens**: Secure token-based authentication
- **CSRF Protection**: Built-in CSRF protection
- **Rate Limiting**: Automatic rate limiting
- **Secure Cookies**: HTTP-only, secure cookies

### ✅ Developer Experience
- **TypeScript Support**: Full TypeScript support
- **React Hooks**: Easy-to-use React hooks
- **Customizable UI**: Styled to match your app's design
- **Webhooks**: Real-time user events

## Code Changes Made

### 1. **Root Layout** (`src/app/layout.tsx`)
```typescript
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### 2. **Middleware** (`src/middleware.ts`)
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/home(.*)',
  '/track(.*)',
  '/analytics(.*)',
  '/profile(.*)',
  '/settings(.*)'
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});
```

### 3. **Sign-In Page** (`src/app/auth/signin/page.tsx`)
```typescript
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: 'bg-gradient-to-r from-[#f5855f] via-[#960047] to-[#953599]',
            // ... other styling
          }
        }}
        redirectUrl="/home"
      />
    </div>
  );
}
```

### 4. **Profile Page** (`src/app/profile/page.tsx`)
```typescript
import { useUser, useClerk } from '@clerk/nextjs';

export default function ProfilePage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  
  return (
    <div>
      <h1>Welcome, {user?.fullName}!</h1>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **"Invalid API Key" Error**
   - Verify your environment variables are set correctly
   - Make sure you're using the right keys (test vs live)
   - Restart your development server after adding environment variables

2. **OAuth Not Working**
   - Check that redirect URLs are configured correctly in Google/Apple consoles
   - Verify your domain is added to allowed origins in Clerk dashboard
   - Make sure OAuth apps are properly configured

3. **Protected Routes Not Working**
   - Check that middleware is properly configured
   - Verify the route patterns in `createRouteMatcher`
   - Make sure Clerk provider is wrapping your app

4. **Styling Issues**
   - Clerk components can be customized with the `appearance` prop
   - Check that your CSS is not conflicting with Clerk's styles
   - Use Clerk's theming system for consistent styling

### Getting Help

- **Clerk Documentation**: https://clerk.com/docs
- **Clerk Discord**: https://discord.gg/clerk
- **GitHub Issues**: https://github.com/clerkinc/javascript

## Migration Benefits

### ✅ **Simplified Setup**
- No more complex SMTP configuration
- No more magic link email setup
- No more database session management

### ✅ **Better User Experience**
- Multiple sign-in options
- Faster authentication flows
- Better error handling

### ✅ **Enhanced Security**
- Built-in security best practices
- Automatic token refresh
- Secure session management

### ✅ **Developer Experience**
- Better TypeScript support
- Easier testing
- Comprehensive documentation

## Next Steps

1. **Customize the UI**: Modify the appearance of Clerk components to match your brand
2. **Add User Metadata**: Store additional user information in Clerk's user metadata
3. **Set Up Webhooks**: Handle user events with Clerk webhooks
4. **Add Role-Based Access**: Implement user roles and permissions
5. **Analytics**: Track authentication events and user behavior

---

**Setup completed successfully!** 🎉

Your Ryze application now uses Clerk for authentication with email, Google, and Apple sign-in options. The authentication system is more robust, secure, and easier to maintain than the previous NextAuth setup.
