# 🚀 Quick Start Guide - Clerk Authentication

## ⚡ Fast Setup (3 minutes)

### 1. Create Clerk Account

1. Go to [clerk.com](https://clerk.com)
2. Sign up and create a new application
3. Name it "EnergyFlow"

### 2. Get API Keys

1. In Clerk Dashboard, go to **API Keys**
2. Copy your **Publishable Key** and **Secret Key**

### 3. Update .env File

Add these to your `.env` file (create if it doesn't exist):

```env
# Database (get from Neon)
DATABASE_URL="your-neon-connection-string-here"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxxxxxxx"
CLERK_SECRET_KEY="sk_test_xxxxxxxx"

# Optional: Customize URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/home"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/home"
```

### 4. Configure Clerk

1. In Clerk Dashboard → **User & Authentication**
2. Enable **Email address** and **Password**
3. Disable any OAuth providers

### 5. Push Database Schema
```bash
npx prisma db push
```

### 6. Start Development Server
```bash
npm run dev
```

### 7. Test It Out!

1. Open [http://localhost:3000](http://localhost:3000)
2. Click "Get Started"
3. Create an account with email & password
4. You're in! 🎉

---

## 📁 What Was Created

### Components & Pages
- ✅ `/sign-in` - Clerk sign in page
- ✅ `/sign-up` - Clerk sign up page  
- ✅ `/home` - Protected dashboard page

### Configuration
- ✅ `src/middleware.ts` - Clerk route protection
- ✅ `src/app/layout.tsx` - ClerkProvider wrapper

### Database Tables (Prisma)
- ✅ `users` - User accounts (with Clerk ID)

---

## 🎯 Key Features

✅ **Email & Password Auth** - Secure authentication via Clerk  
✅ **Email Verification** - Built-in email verification  
✅ **Protected Routes** - `/home` requires authentication  
✅ **User Management** - Clerk Dashboard for admin  
✅ **TypeScript Support** - Full type safety  
✅ **Beautiful UI** - Clean, modern Clerk components  
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
- **`CLERK_SETUP.md`** - Complete Clerk setup guide
- **`DATABASE_SETUP.md`** - Database configuration

---

## ✅ Verification Checklist

Before testing, ensure:
- [ ] Neon database is created (PostgreSQL 17)
- [ ] `DATABASE_URL` is set in `.env`
- [ ] Clerk account created
- [ ] Clerk API keys added to `.env`
- [ ] Email & password enabled in Clerk Dashboard
- [ ] Ran `npx prisma db push`
- [ ] Dev server is running

---

## 🆘 Common Issues

### Can't sign in?
- Check Clerk API keys in `.env`
- Ensure keys start with `pk_test_` and `sk_test_`
- Restart dev server after changing `.env`
- Check Clerk Dashboard for user status

### Can't access /home?
- Make sure you're signed in
- Clear browser cookies
- Check middleware configuration
- Verify Clerk is properly configured

### Database errors?
- Verify `DATABASE_URL` is correct
- Run `npx prisma db push` again
- Check Neon dashboard for database status

---

## 🎉 You're All Set!

Your app now has:
- Secure email authentication
- Protected routes
- Beautiful auth pages
- Full TypeScript support

**Next Steps:**
1. Build your energy tracking dashboard
2. Add check-in forms
3. Create data visualizations
4. Deploy to production

Happy coding! 🚀

