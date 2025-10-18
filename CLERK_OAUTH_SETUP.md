# Clerk OAuth Setup Guide - Google & Apple Sign-In

This guide will help you configure Google and Apple OAuth providers in your Clerk dashboard to enable social sign-in options in your Ryze application.

## Prerequisites

- Clerk account and application set up
- Google Cloud Console access (for Google OAuth)
- Apple Developer account (for Apple Sign-In)

## Step 1: Configure Google OAuth

### 1.1 Set up Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `https://your-clerk-domain.clerk.accounts.dev/v1/oauth_callback`
     - `http://localhost:3000/v1/oauth_callback` (for development)
   - Copy the Client ID and Client Secret

### 1.2 Configure in Clerk Dashboard

1. Go to your Clerk dashboard
2. Navigate to "User & Authentication" → "Social Connections"
3. Click "Add Google"
4. Enter your Google OAuth credentials:
   - **Client ID**: Your Google OAuth Client ID
   - **Client Secret**: Your Google OAuth Client Secret
5. Click "Save"

## Step 2: Configure Apple Sign-In

### 2.1 Set up Apple Developer Console

1. Go to [Apple Developer Console](https://developer.apple.com/account/)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Create a new App ID:
   - Go to "Identifiers" → "App IDs"
   - Click "+" to create new
   - Choose "App" and continue
   - Enter description and bundle ID
   - Enable "Sign In with Apple" capability
   - Register the App ID

4. Create a Service ID:
   - Go to "Identifiers" → "Services IDs"
   - Click "+" to create new
   - Enter description and identifier
   - Enable "Sign In with Apple"
   - Configure domains and redirect URLs:
     - Primary App ID: Select your App ID
     - Domains: `your-clerk-domain.clerk.accounts.dev`
     - Redirect URLs: `https://your-clerk-domain.clerk.accounts.dev/v1/oauth_callback`

5. Create a Key:
   - Go to "Keys" → "All"
   - Click "+" to create new
   - Enter key name
   - Enable "Sign In with Apple"
   - Configure with your App ID
   - Download the key file (.p8)
   - Note the Key ID

### 2.2 Configure in Clerk Dashboard

1. Go to your Clerk dashboard
2. Navigate to "User & Authentication" → "Social Connections"
3. Click "Add Apple"
4. Enter your Apple credentials:
   - **Team ID**: Your Apple Developer Team ID
   - **Key ID**: The Key ID from step 2.1.5
   - **Private Key**: Content of the .p8 key file
   - **Client ID**: Your Service ID from step 2.1.4
5. Click "Save"

## Step 3: Configure Email Authentication

1. In Clerk dashboard, go to "User & Authentication" → "Email, Phone, Username"
2. Enable "Email address" as a sign-in method
3. Configure email templates if desired
4. Set up email verification settings

## Step 4: Test the Configuration

### 4.1 Development Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth/signin`
3. Test each sign-in method:
   - **Email**: Create account with email/password
   - **Google**: Sign in with Google account
   - **Apple**: Sign in with Apple ID (if on iOS/macOS)

### 4.2 Production Testing

1. Deploy your application
2. Update OAuth redirect URLs in Google/Apple consoles to include your production domain
3. Test all sign-in methods on production

## Step 5: Environment Variables

Make sure your `.env.local` file includes:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your-publishable-key"
CLERK_SECRET_KEY="sk_test_your-secret-key"

# Custom URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/auth/signin"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/auth/signup"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/home"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/home"

# Database
DATABASE_URL="your-database-url"
```

## Features Enabled

### ✅ Multiple Sign-In Options
- **Email/Password**: Traditional authentication
- **Google OAuth**: Sign in with Google account
- **Apple Sign-In**: Sign in with Apple ID
- **Magic Links**: Passwordless email authentication (optional)

### ✅ Last Used Method
Clerk automatically remembers and prioritizes the last used sign-in method for each user, providing a seamless experience.

### ✅ Account Linking
Users can link multiple authentication methods to the same account for flexibility.

### ✅ Security Features
- OAuth 2.0 compliance
- Secure token handling
- CSRF protection
- Rate limiting

## Troubleshooting

### Google OAuth Issues
- Verify redirect URIs match exactly
- Check that Google+ API is enabled
- Ensure Client ID and Secret are correct
- Test with different Google accounts

### Apple Sign-In Issues
- Verify Service ID configuration
- Check that domains are properly configured
- Ensure key file is correctly uploaded
- Test on iOS/macOS devices for best compatibility

### General Issues
- Clear browser cookies and cache
- Check Clerk dashboard for error logs
- Verify environment variables are set correctly
- Restart development server after changes

## Production Considerations

1. **Use Live Keys**: Switch from test to live keys in production
2. **Update Redirect URLs**: Include production domain in OAuth configurations
3. **Monitor Usage**: Track authentication metrics in Clerk dashboard
4. **Error Handling**: Implement proper error handling for failed authentications
5. **User Experience**: Test on various devices and browsers

## Support

- **Clerk Documentation**: https://clerk.com/docs
- **Google OAuth Guide**: https://developers.google.com/identity/protocols/oauth2
- **Apple Sign-In Guide**: https://developer.apple.com/sign-in-with-apple/

---

**Setup completed successfully!** 🎉

Your Ryze application now supports email, Google, and Apple sign-in with automatic last-used method detection.
