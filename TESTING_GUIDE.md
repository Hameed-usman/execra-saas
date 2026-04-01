# Complete Testing Guide for Execra

*A comprehensive step-by-step testing guide for beginners - created by your senior developer*

---

## Table of Contents
1. [Project Architecture Overview](#project-architecture-overview)
2. [Technologies & Their Roles](#technologies--their-roles)
3. [Docker Setup Explained](#docker-setup-explained)
4. [How Authentication Works](#how-authentication-works)
5. [Setup & Prerequisites](#setup--prerequisites)
6. [Step-by-Step Testing Guide](#step-by-step-testing-guide)
7. [Troubleshooting](#troubleshooting)

---

## Project Architecture Overview

### What You've Built

Your project is a **multi-tenant SaaS application** with:
- **Frontend**: Modern UI for landing, signup, login, onboarding, and dashboard
- **Backend**: API routes for authentication and data management
- **Database**: PostgreSQL with Prisma ORM to store users, tenants, and startup profiles
- **Auth System**: NextAuth v5 with email/password credentials

### The User Journey

```
User arrives → Landing Page → Signup (creates account + company)
→ Onboarding (fills company info) → Dashboard (protected page)
→ Or Login (existing user) → Dashboard
```

---

## Technologies & Their Roles

### **1. Next.js (v16.1.7)**
- **What it is**: A React framework that handles both frontend and backend
- **Your setup**: Used for pages, API routes, and server-side rendering
- **Key files in your project**:
  - `app/page.tsx` - Landing page
  - `app/(auth)/login/page.tsx` - Login page
  - `app/(auth)/signup/page.tsx` - Signup page
  - `app/api/auth/` - Authentication API endpoints

### **2. NextAuth (v5)**
- **What it is**: Authentication library that manages user sessions and login/logout
- **Your setup**: Using "Credentials" provider (email + password)
- **How it works**:
  1. User enters email/password on login page
  2. NextAuth verifies credentials against database
  3. If valid, creates a JWT token and session
  4. Token is stored in httpOnly cookies (secure)
  5. Protected pages check if session exists

### **3. Prisma (v7.5.0)**
- **What it is**: "Database translator" - lets you write code instead of SQL
- **Your setup**: Connected to PostgreSQL
- **Key features**:
  - `schema.prisma` defines your database structure
  - `PrismaClient` is used to read/write data
  - Handles migrations automatically

### **4. PostgreSQL (via Docker)**
- **What it is**: The actual database storing your data
- **Running in**: Docker container (isolated environment)
- **What gets stored**:
  - **Tenant**: Company information
  - **User**: User accounts (email, hashed password, name)
  - **StartupProfile**: Company profile details

### **5. Docker**
- **What it is**: Containerization - like shipping your database in a self-contained box
- **Why use it**: Developers, testers, and production all use identical setup
- **Running in your project**: PostgreSQL and Redis services

---

## Docker Setup Explained

### Your docker-compose.yml

```yaml
services:
  postgres:
    image: postgres:16              # PostgreSQL version 16
    container_name: execra_postgres # Unique name
    environment:
      POSTGRES_DB: execra           # Database name
      POSTGRES_USER: execra         # Username
      POSTGRES_PASSWORD: execra_local_pass  # Password
    ports:
      - "5432:5432"                # Map port 5432 (host) → 5432 (container)
    volumes:
      - postgres_data:/var/lib/postgresql/data  # Store data persistently
  
  redis:
    image: redis:7                  # Redis cache
    ports:
      - "6379:6379"
```

### What This Means

- **Port 5432**: Where your application connects to PostgreSQL (localhost:5432)
- **Volumes**: Your database data persists even if containers restart
- **Environment variables**: Configuration passed to PostgreSQL
- **redis**: You have Redis running (for future caching needs)

---

## How Authentication Works

### The Signup Flow

```
User submits signup form
    ↓
Form sends POST to /api/auth/register
    ↓
Backend receives: { name, email, password, companyName }
    ↓
Password is hashed using bcryptjs (never stored as plain text)
    ↓
Tenant (company) is created in database
    ↓
User is created and linked to Tenant
    ↓
Frontend redirects to /onboarding page
```

### The Login Flow

```
User enters email & password
    ↓
Frontend calls SignIn from NextAuth
    ↓
NextAuth runs authorize() function:
  - Finds user by email in database
  - Compares password with stored hash using bcryptjs
  - If match: Creates JWT token
  ↓
Token stored in httpOnly cookie (secure)
    ↓
User redirected to /dashboard
```

### Session Management

- **JWT Strategy**: Token contains user ID + tenant ID
- **Token passed to**: Every request via cookies (automatic with NextAuth)
- **Protected pages**: Check `await auth()` - if no session, redirect to login

---

## Setup & Prerequisites

### Required Before Testing

1. **Node.js**: Install from nodejs.org (v18+)
2. **Docker Desktop**: [Download here](https://www.docker.com/products/docker-desktop/)
3. **Git**: For version control

### Environment Setup

Create `.env.local` file in project root:

```env
DATABASE_URL="postgresql://execra:execra_local_pass@localhost:5432/execra"
NEXTAUTH_SECRET="your-secret-key-here-make-it-random-and-long"
NEXTAUTH_URL="http://localhost:3000"
```

**How to generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
# Copy the output and paste it in .env.local
```

---

## Step-by-Step Testing Guide

### Phase 1: Environment Setup (5-10 minutes)

#### Step 1.1: Start Docker Services

```bash
cd d:\WEB PROJECTS\execra
docker-compose up -d
```

**What this does**:
- `-d` = runs in background (detached mode)
- Starts PostgreSQL and Redis containers
- Creates a `postgres_data` volume for persistent storage

**Verify it's running**:
```bash
docker ps
```

You should see both `execra_postgres` and `execra_redis` listed.

#### Step 1.2: Install Dependencies

```bash
npm install
```

This installs all packages from package.json

#### Step 1.3: Run Database Migrations

```bash
npx prisma migrate deploy
```

**What this does**:
- Applies all migrations in `prisma/migrations/`
- Creates tables in PostgreSQL based on schema.prisma
- Makes database ready for data

**Verify migration succeeded**:
```bash
npx prisma studio
```

A browser opens showing your database structure (tables: Tenant, User, StartupProfile)
- If you see these tables, migration worked ✓
- Close this window with Ctrl+C

#### Step 1.4: Start Development Server

```bash
npm run dev
```

**Terminal output should show**:
```
▲ Next.js 16.1.7
- Local:        http://localhost:3000
- Environments: .env.local
```

Open http://localhost:3000 in your browser

---

### Phase 2: Frontend & Landing Page Testing (5-10 minutes)

#### Step 2.1: Verify Landing Page

Open http://localhost:3000

**Check these sections load**:
- Hero section with CTA buttons ✓
- "Sign Up" button visible ✓
- "Log In" button visible ✓
- Features, pricing, testimonials ✓
- Smooth animations (Framer Motion) ✓

**What you're checking**: Frontend is rendering correctly

---

### Phase 3: Signup Flow Testing (10-15 minutes)

#### Step 3.1: Start Fresh Signup

Click "Sign Up" button → Navigate to http://localhost:3000/signup

**On signup page, you should see**:
- Name field ✓
- Email field ✓
- Password field (with show/hide button) ✓
- Company Name field ✓
- Password strength indicator ✓
- "Sign Up" button ✓

#### Step 3.2: Test Form Validation

Fill in signup form with:
```
Name: John Developer
Email: john@example.com
Password: SecurePass123!
Company Name: My Startup
```

Click Sign Up button

**Expected behavior**:
1. Button shows loading state (disabled/spinner)
2. After 1-2 seconds, you're redirected to `/onboarding`
3. If redirected to onboarding → Registration succeeded ✓

**If you get an error**:
- Note the error message
- Check terminal for backend errors (see Step 3.4)

#### Step 3.3: Verify Data in Database

Open a new terminal (keep dev server running):

```bash
npx prisma studio
```

1. Click on "Tenant" table
2. Look for your company name ("My Startup")
3. Click on it to see the `id`
4. Go to "User" table
5. Should see your user with:
   - `email: john@example.com`
   - `name: John Developer`
   - `tenantId` matching the Tenant

**If you see this data → Signup worked ✓**

#### Step 3.4: Check API Logs

In your dev server terminal, look for API logs:

```
POST /api/auth/register 201 in 245ms
```

**Status codes**:
- `201`: Success ✓
- `400`: Missing fields
- `409`: Email already exists
- `500`: Server error

Check the exact error:
```
[REGISTER_ERROR] [Error details]
```

---

### Phase 4: Onboarding Flow Testing (10 minutes)

#### Step 4.1: Complete Onboarding

After signup, you're on `/onboarding`

**Steps to complete**:
1. Choose Industry (e.g., "Tech")
2. Choose Stage (e.g., "Seed")
3. Set Team Size slider
4. Enter description
5. Set goals
6. List competitors
7. Select tools (e.g., "Gmail", "Stripe")
8. Click "Complete Setup"

**Expected**: 
- Redirected to `/dashboard` after ~1 second
- "Confetti" animation shows (celebrations) ✓

#### Step 4.2: Verify Onboarding Data in Database

```bash
npx prisma studio
```

1. Go to "StartupProfile" table
2. Should see entry with:
   - Your company's info
   - `industry: Tech`
   - `stage: Seed`
   - `teamSize: [your number]`
   - `tools: ["Gmail","Stripe",...]` (JSON array)

**If data exists → Onboarding worked ✓**

---

### Phase 5: Login Flow Testing (10-15 minutes)

#### Step 5.1: Logout First

On dashboard, find logout button (user avatar in sidebar)

Click to logout → Redirected to landing page ✓

#### Step 5.2: Navigate to Login Page

Go to http://localhost:3000/login

Or click "Log In" button on landing page

**Verify**:
- Email field ✓
- Password field ✓
- "Sign In" button ✓
- Right panel shows dashboard preview

#### Step 5.3: Test Correct Credentials

Enter the credentials from signup:
```
Email: john@example.com
Password: SecurePass123!
```

Click "Sign In"

**Expected**:
1. Button shows loading state
2. After 1-2 seconds, redirected to `/dashboard`
3. Dashboard displays your name and user info ✓

**If successful → Login system works ✓**

#### Step 5.4: Test Wrong Password

Log out, return to login page

Enter:
```
Email: john@example.com
Password: WrongPassword
```

Click "Sign In"

**Expected**:
- Error message appears: "Invalid email or password" ✓
- Page shakes (animation indicating error) ✓
- You stay on login page ✓

**If this happens → Error handling works ✓**

#### Step 5.5: Test Non-Existent Email

Enter:
```
Email: nope@example.com
Password: SecurePass123!
```

**Expected**:
- Same error message ✓
- Not allowed in (security best practice) ✓

---

### Phase 6: Dashboard Protection Testing (5 minutes)

#### Step 6.1: Verify Protected Route

While logged out, manually go to: http://localhost:3000/dashboard

**Expected**:
- Redirected to `/login` automatically ✓
- (NextAuth blocking unauthorized access)

#### Step 6.2: Test Session Persistence

1. Login to dashboard
2. Refresh the page (F5)
3. **Expected**: Stay logged in, dashboard still shows ✓

**Why**: JWT token in cookie persists across page refreshes

#### Step 6.3: Test Session Expiration (Advanced)

This happens after 30 days of inactivity (NextAuth default)
- Can skip for now, but know it exists

---

### Phase 7: API Response Verification (10 minutes)

#### Step 7.1: Check Signup API Response

Open browser DevTools: Press F12

1. Go to "Network" tab
2. Go to signup page (Ctrl+L: http://localhost:3000/signup)
3. Fill form and submit
4. In Network tab, find `register` request
5. Click it, go to "Response"

You should see:
```json
{
  "success": true,
  "userId": "some-uuid-here"
}
```

**If you see this → API returns correct format ✓**

#### Step 7.2: Check Login API Response

1. Network tab
2. Go to login page
3. Login with correct credentials
4. Find request to `[...nextauth]` (NextAuth endpoint)
5. Check Response

Should contain session data with:
```json
{
  "user": {
    "id": "your-user-id",
    "email": "your@email.com",
    "name": "Your Name",
    "tenantId": "your-tenant-id"
  }
}
```

**If present → Session data correct ✓**

#### Step 7.3: Check Error Response

1. Network tab
2. Try signup with existing email (use john@example.com again)
3. Find `register` request
4. Check Response

Should see:
```json
{
  "error": "Email already exists"
}
```

**Status should be 409 (Conflict) ✓**

---

### Phase 8: Docker & Database Connection Testing (10 minutes)

#### Step 8.1: Verify Docker Containers

```bash
docker ps
```

Should show:
```
execra_postgres    postgres:16    Running
execra_redis       redis:7        Running
```

#### Step 8.2: View Docker Logs

**PostgreSQL logs**:
```bash
docker logs execra_postgres
```

Look for:
```
database system is ready to accept connections
```

**What this means**: DB is running and accepting queries ✓

#### Step 8.3: Access PostgreSQL Directly (Advanced)

```bash
docker exec -it execra_postgres psql -U execra -d execra
```

Now you're in PostgreSQL command line!

List all tables:
```sql
\dt
```

You should see:
```
Tenant
User
StartupProfile
```

View User table:
```sql
SELECT email, name FROM "User";
```

Should show your signup credentials ✓

Exit:
```sql
\q
```

#### Step 8.4: Check Database Connections

In your project, verify the connection string:

Open `.env.local` and confirm:
```
DATABASE_URL="postgresql://execra:execra_local_pass@localhost:5432/execra"
```

This tells Prisma how to connect to Docker's PostgreSQL

---

### Phase 9: Comprehensive Email Test

#### Step 9.1: Test Email Uniqueness

Try signing up with the same email again:
```
Email: john@example.com (already used)
Password: AnyPassword123!
Name: Jane Developer
Company: Another Company
```

**Expected**:
- Error: "Email already exists" ✓
- HTTP Status: 409 (Conflict) ✓
- No duplicate created in database ✓

#### Step 9.2: Test Email Validation

Try signup with invalid email:
```
Email: notanemail
Password: SecurePass123!
...
```

**Behavior**: Browser form validation prevents this before backend (HTML5)

---

### Phase 10: Password Security Testing (10 minutes)

#### Step 10.1: Verify Password Hashing

1. Create user with signup
2. Open `prisma studio`
3. Go to User table
4. Click on user
5. Look at `passwordHash` field

**Expected**:
- Shows something like: `$2a$12$...` (bcrypt format) ✓
- NOT equal to your actual password ✓
- Looks like random characters ✓

**Why this matters**: Even if DB is compromised, passwords are safe

#### Step 10.2: Test Password Strength Indicator

On signup page:
1. Password field shows real-time strength
2. Type `pass` → "Weak" (Red) ✓
3. Type `Pass123` → "Fair" (Orange) ✓
4. Type `Pass@123!` → "Strong" (Green) ✓

**What's being checked**:
- Minimum 8 characters
- Uppercase letter
- Number
- Special character

---

### Phase 11: Full End-to-End Flow (15 minutes)

#### Step 11.1: Complete Fresh User Journey

1. **Landing Page**: Open http://localhost:3000
2. **Signup**: Click signup, enter new user:
   ```
   Name: Test User 2
   Email: test2@example.com
   Password: TestPass123!
   Company: Test Company 2
   ```
3. **Onboarding**: Fill all fields, complete
4. **Dashboard**: Verify you see your name and dashboard loads
5. **Logout**: Click user avatar, logout
6. **Login**: Log back in with test2@example.com
7. **Verify**: Dashboard loads with correct user ✓

**If all these 7 steps work → Your whole app is functional ✓**

---

### Phase 12: Performance & Responsiveness

#### Step 12.1: Check Page Load Times

In DevTools Network tab:
- Landing page: Should load in <1 second
- Signup: Should load in <1 second
- Login: Should load in <1 second
- Dashboard: Should load in <2 seconds (server-side checks)

#### Step 12.2: Test Mobile Responsiveness

1. DevTools → Click device icon (Toggle device toolbar)
2. Select "iPhone 12" or similar
3. Navigate through signup/login/dashboard
4. Verify layouts adapt correctly ✓

---

## Troubleshooting

### "Cannot find module '@prisma/client'"

**Solution**:
```bash
npm install
npx prisma generate
```

### "DATABASE_URL is not set"

**Solution**:
1. Create `.env.local` file in project root
2. Add: `DATABASE_URL="postgresql://execra:execra_local_pass@localhost:5432/execra"`
3. Save file
4. Restart dev server

### "Connection refused: localhost:5432"

**Docker not running**
```bash
docker-compose up -d
docker ps  # Verify containers are running
```

### "Email already exists" on first signup

**Residual data from previous test**
```bash
# Option 1: Reset database
docker-compose down -v
docker-compose up -d
npx prisma migrate deploy

# Option 2: Clear data only
npx prisma migrate reset
```

### Login not working, but signup worked

**Check these**:
1. Did you type the password correctly?
2. Is the database still running? `docker ps`
3. Check backend logs in terminal for errors
4. Try a fresh signup and immediate login

### "NEXTAUTH_SECRET is missing"

**Solution**:
```bash
# Generate a secret
openssl rand -base64 32
# Copy output and add to .env.local:
NEXTAUTH_SECRET="your-generated-secret-here"
# Restart dev server
```

### Onboarding not saving

**Check**:
1. DevTools Network tab → onboarding request status
2. Backend logs for `[ONBOARDING_ERROR]`
3. Verify tenantId is in session: Login → DevTools Console:
   ```javascript
   // In browser console after login
   fetch('/api/auth/session').then(r => r.json()).then(console.log)
   ```

### Docker container crashes

**Logs**:
```bash
docker logs execra_postgres
docker logs execra_redis
```

**Fix**:
```bash
docker-compose restart
docker-compose logs
```

---

## Testing Checklist

✓ = Test passed

- [ ] Docker containers running
- [ ] npm install completed
- [ ] Database migrations applied
- [ ] Dev server starts without errors
- [ ] Landing page loads and displays
- [ ] Signup page form appears
- [ ] Signup creates user in DB
- [ ] Signup redirects to onboarding
- [ ] Onboarding form works
- [ ] Onboarding saves data to DB
- [ ] Onboarding redirects to dashboard
- [ ] Dashboard shows user name
- [ ] Logout button works
- [ ] Login page displays
- [ ] Login with correct credentials works
- [ ] Login redirects to dashboard
- [ ] Login with wrong password shows error
- [ ] Dashboard is protected (can't access without login)
- [ ] Session persists on page refresh
- [ ] API responses are correct (DevTools)
- [ ] Password is hashed in DB (not plaintext)
- [ ] Duplicate email prevention works
- [ ] End-to-end flow works (signup → onboarding → dashboard → logout → login)

---

## Summary: How It All Connects

```
┌─────────────────────────────────────────────────────────┐
│                     YOUR APPLICATION                    │
├─────────────────────────────────────────────────────────┤
│  Frontend (React Components)                            │
│  ├─ Landing page                                        │
│  ├─ Signup page → calls /api/auth/register             │
│  ├─ Login page → calls NextAuth signIn()               │
│  ├─ Onboarding page → calls /api/onboarding            │
│  └─ Dashboard → protected by auth()                    │
├─────────────────────────────────────────────────────────┤
│  Backend (Next.js API Routes)                           │
│  ├─ /api/auth/[...nextauth] - Session management       │
│  ├─ /api/auth/register - Create user                   │
│  └─ /api/onboarding - Save company info                │
├─────────────────────────────────────────────────────────┤
│  Prisma ORM - Translates your code to SQL              │
├─────────────────────────────────────────────────────────┤
│  Docker Container (PostgreSQL)                          │
│  └─ Actual database storing data                        │
└─────────────────────────────────────────────────────────┘
```

**Data Flow**:
1. User interacts with frontend
2. Frontend calls API endpoints
3. Backend uses Prisma to talk to database
4. Prisma sends SQL to PostgreSQL
5. Database returns data
6. Backend sends response to frontend
7. Frontend updates UI

---

## Next Steps After Testing

1. ✅ Complete all tests above
2. ✅ Verify database has test data
3. 🔜 Build additional features (AI agents, integrations, etc.)
4. 🔜 Add automated tests (Jest, React Testing Library)
5. 🔜 Set up email verification (currently not implemented)
6. 🔜 Add password reset flow
7. 🔜 Deploy to production

---

## Questions to Ask Yourself

After testing, you should understand:
- [ ] How signup creates both a Tenant and User in DB?
- [ ] Why password is hashed and not stored as plaintext?
- [ ] How JWT token keeps user logged in across refreshes?
- [ ] What happens when user clicks logout?
- [ ] Why dashboard redirects to login if accessed logged out?
- [ ] How Docker keeps PostgreSQL isolated?
- [ ] How Prisma translates from your code to SQL?

If you can answer these → You deeply understand your system ✓

---

## Support

If you encounter issues:
1. Check "Troubleshooting" section above
2. Look at terminal error messages carefully
3. Check Docker logs: `docker logs execra_postgres`
4. Verify .env.local is correctly configured
5. Search GitHub issues for similar problems
6. Ask your AI assistant or team

Good luck! 🚀
