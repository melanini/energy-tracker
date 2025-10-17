# 🚀 Quick Start Guide - NextAuth Authentication

## ⚡ Fast Setup (3 minutes)

### 1. Set Up Google OAuth (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000/api/auth/callback/google` to authorized redirect URIs

### 2. Update .env File

Add these to your `.env` file (create if it doesn't exist):

```env
# Database (get from Neon)
DATABASE_URL="your-neon-connection-string-here"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

### 4. Push Database Schema
```bash
npx prisma db push
```

### 5. Start Development Server
```bash
npm run dev
```

### 6. Test It Out!

1. Open [http://localhost:3000](http://localhost:3000)
2. Click "Get Started"
3. Sign in with Google OAuth or use credentials provider
4. You're in! 🎉

---

## 📁 What Was Created

### Components & Pages
- ✅ `/auth/signin` - NextAuth sign in page
- ✅ `/auth/signup` - NextAuth sign up page  
- ✅ `/home` - Protected dashboard page

### Configuration
- ✅ `src/middleware.ts` - NextAuth route protection
- ✅ `src/app/layout.tsx` - NextAuth SessionProvider wrapper
- ✅ `src/lib/auth.ts` - NextAuth configuration

### Database Tables (Prisma)
- ✅ `users` - User accounts
- ✅ `accounts` - OAuth account connections
- ✅ `sessions` - User sessions
- ✅ `verificationTokens` - Email verification

---

## 🎯 Key Features

✅ **Google OAuth Auth** - Secure authentication via Google  
✅ **Credentials Provider** - Email/password authentication for development  
✅ **Email Verification** - Built-in email verification  
✅ **Protected Routes** - `/home` requires authentication  
✅ **Session Management** - JWT-based sessions  
✅ **TypeScript Support** - Full type safety  
✅ **Beautiful UI** - Clean, modern authentication pages  
✅ **Mobile First** - Responsive design  
✅ **Production Ready** - Enterprise-grade security  

---

## 🔧 Commands Reference

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Open database GUI
npx prisma studio

# Generate NextAuth secret
openssl rand -base64 32

# Start dev server
npm run dev
```

---

## 📖 Full Documentation

For detailed setup, troubleshooting, and production deployment:
- **`NEXTAUTH_SETUP.md`** - Complete NextAuth setup guide
- **`DATABASE_SETUP.md`** - Database configuration

---

## ✅ Verification Checklist

Before testing, ensure:
- [ ] Neon database is created (PostgreSQL 17)
- [ ] `DATABASE_URL` is set in `.env`
- [ ] `NEXTAUTH_SECRET` is set in `.env`
- [ ] `NEXTAUTH_URL` is set in `.env`
- [ ] Google OAuth credentials configured (optional)
- [ ] Ran `npx prisma db push`
- [ ] Dev server is running

---

## 🆘 Common Issues

### Can't sign in?
- Check NextAuth configuration in `.env`
- Ensure `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set
- Restart dev server after changing `.env`
- Check Google OAuth credentials if using Google sign-in

### Can't access /home?
- Make sure you're signed in
- Clear browser cookies
- Check middleware configuration
- Verify NextAuth is properly configured

### Database errors?
- Verify `DATABASE_URL` is correct
- Run `npx prisma db push` again
- Check Neon dashboard for database status

### Google OAuth not working?
- Verify Google OAuth credentials are correct
- Check authorized redirect URIs in Google Console
- Ensure callback URL is: `http://localhost:3000/api/auth/callback/google`

---

## 🎉 You're All Set!

Your app now has:
- Secure Google OAuth authentication
- Credentials provider for development
- Protected routes
- Beautiful auth pages
- Full TypeScript support

**Next Steps:**
1. Build your energy tracking dashboard
2. Add check-in forms
3. Create data visualizations
4. Deploy to production

Happy coding! 🚀

