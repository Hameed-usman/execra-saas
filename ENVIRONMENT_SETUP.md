# Environment Setup Guide

This guide will help you set up your environment correctly before testing.

## Prerequisites Installation

### 1. Install Node.js (if not already installed)

1. Go to https://nodejs.org
2. Download "LTS" version (v20 or higher)
3. Run installer and follow prompts
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

### 2. Install Docker Desktop (if not already installed)

1. Download from https://www.docker.com/products/docker-desktop
2. Run installer
3. Follow setup wizard
4. After installation, Docker Desktop should auto-start
5. Verify Docker is running:
   ```bash
   docker --version
   docker ps
   ```

**Windows Users**: Docker Desktop requires WSL2 (Windows Subsystem for Linux 2)
- Docker installer handles this automatically
- Just accept prompts during installation

### 3. Install Git (optional but recommended)

1. Download from https://git-scm.com
2. Run installer with default settings
3. Verify:
   ```bash
   git --version
   ```

---

## Project Setup

### Step 1: Navigate to Project Directory

```bash
cd d:\WEB PROJECTS\execra
```

### Step 2: Create `.env.local` File

This file contains sensitive configuration. **Never commit to git!**

In the project root (`d:\WEB PROJECTS\execra\`), create a new file named `.env.local`

Add this content:

```env
# Database connection string
# Format: postgresql://username:password@host:port/database
DATABASE_URL="postgresql://execra:execra_local_pass@localhost:5432/execra"

# NextAuth secret key - generate a secure random value
# Run: openssl rand -base64 32
# Or use: https://generate-secret.vercel.app/32
NEXTAUTH_SECRET="generated-secret-key-here-32-characters-minimum"

# NextAuth URL - where your app is running
NEXTAUTH_URL="http://localhost:3000"

# Node environment
NODE_ENV="development"
```

### Step 3: Generate NEXTAUTH_SECRET

**Option A: Using OpenSSL (Mac/Linux/WSL)**
```bash
openssl rand -base64 32
```

**Option B: Online Generator**
Go to https://generate-secret.vercel.app/32 and copy the generated secret

**Option C: Manual (Not secure but works for local dev)**
```
aXFwbzk4aXdoZWp3aXdxZXdxZWFzZHdhc2Rhc2Rhc2Rhc2Q=
```

Copy the generated secret and add it to `.env.local`:
```env
NEXTAUTH_SECRET="aXFwbzk4aXdoZWp3aXdxZXdxZWFzZHdhc2Rhc2Rhc2Rhc2Q="
```

### Step 4: Verify `.env.local` File

```bash
# Windows PowerShell
type .env.local

# Mac/Linux/WSL
cat .env.local
```

Should show:
```
DATABASE_URL=postgresql://execra:execra_local_pass@localhost:5432/execra
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

✅ If all three values are present, you're good!

---

## Docker Setup

### Step 1: Start Docker Services

```bash
docker-compose up -d
```

**What this does**:
- `-d` = runs in background (detached)
- Reads `docker-compose.yml`
- Starts PostgreSQL container
- Starts Redis container
- Creates volume for data persistence

### Step 2: Verify Services Are Running

```bash
docker ps
```

You should see:

```
CONTAINER ID   IMAGE           STATUS
abc123def      postgres:16     Up 2 minutes
xyz789abc      redis:7         Up 2 minutes
```

**If status shows "Up" → ✅ Services running**

### Step 3: Check PostgreSQL Is Healthy

```bash
docker logs execra_postgres
```

Look for this line:
```
database system is ready to accept connections
```

✅ **If you see this → Database is ready**

---

## Node.js Dependencies

### Step 1: Install Dependencies

```bash
npm install
```

This reads `package.json` and installs:
- next
- next-auth
- prisma
- react
- bcryptjs
- All other dependencies

**First time**: May take 2-3 minutes

### Step 2: Verify Installation

```bash
npm list
```

Should show all packages installed without errors

---

## Prisma Setup

### Step 1: Generate Prisma Client

```bash
npx prisma generate
```

This creates the Prisma client based on `schema.prisma`

### Step 2: Run Database Migrations

```bash
npx prisma migrate deploy
```

This creates tables in PostgreSQL:
- `Tenant` table
- `User` table
- `StartupProfile` table

**Expected output**:
```
Applying migration `20260321112043_init`
```

### Step 3: Verify Database Setup

```bash
npx prisma studio
```

A browser window opens showing your database tables

**Check you can see**:
- Tenant (empty)
- User (empty)
- StartupProfile (empty)

✅ If you see these tables → Database is ready

Close this window with Ctrl+C

---

## Next.js Development Server

### Step 1: Start Development Server

```bash
npm run dev
```

**Expected output**:
```
▲ Next.js [version]
- Local:        http://localhost:3000
- Environments: .env.local
```

### Step 2: Access Your Application

Open http://localhost:3000 in your browser

You should see:
- Landing page
- Logo
- Navigation
- Hero section
- "Sign Up" and "Log In" buttons

✅ If page loads → Everything is set up!

---

## Troubleshooting Setup

### Problem: "Cannot connect to Docker daemon"

**Solutions**:
1. Make sure Docker Desktop is running
2. Try: `docker ps` to verify
3. Restart Docker Desktop
4. Restart computer

### Problem: "Port 5432 already in use"

**Reason**: PostgreSQL is already running

**Solutions**:
```bash
# Stop existing containers
docker-compose down

# Start fresh
docker-compose up -d

# If still failing, kill process on port 5432
# Windows PowerShell:
netstat -ano | findstr :5432
# Find PID and kill it:
taskkill /pid [PID] /f

# Mac/Linux:
lsof -ti:5432 | xargs kill -9
```

### Problem: "npm: command not found"

**Reason**: Node.js not installed

**Solution**:
1. Install Node.js from nodejs.org
2. Restart terminal/PowerShell
3. Try `npm --version` again

### Problem: ".env.local not found" in app logs

**Solution**:
1. Verify `.env.local` exists in project root:
   ```bash
   # Windows
   dir .env.local
   
   # Mac/Linux
   ls -la .env.local
   ```
2. If missing, create it (see Step 2 above)
3. Restart dev server: Stop with Ctrl+C, run `npm run dev` again

### Problem: "DATABASE_URL is invalid"

**Check**:
1. No extra spaces in `.env.local`
2. Correct format: `postgresql://user:pass@host:port/db`
3. Database name is lowercase: `execra`
4. Password matches docker-compose.yml: `execra_local_pass`

### Problem: "NEXTAUTH_SECRET missing"

**Solution**:
1. Generate secret: `openssl rand -base64 32`
2. Add to `.env.local`: `NEXTAUTH_SECRET="your-secret"`
3. Restart dev server

### Problem: Prisma migration fails

**Solution**:
```bash
# Check if database is running
docker ps

# If not, start it
docker-compose up -d

# Try migration again
npx prisma migrate deploy

# If still fails, reset everything
docker-compose down -v
docker-compose up -d
npx prisma migrate deploy
```

---

## Verification Checklist

After following all steps above, verify everything is working:

- [ ] Node.js installed: `node --version`
- [ ] npm installed: `npm --version`
- [ ] Docker running: `docker ps`
- [ ] PostgreSQL container running
- [ ] Redis container running
- [ ] `.env.local` file created with 3 variables
- [ ] Dependencies installed: `npm list` shows packages
- [ ] Database migrated: `npx prisma studio` shows tables
- [ ] Dev server running: `npm run dev`
- [ ] Can access http://localhost:3000

✅ **If all checked → You're ready to test!**

---

## Starting Development Workflow

Every time you want to work on the project:

```bash
# Terminal 1: Start Docker (only needed first time or if stopped)
docker-compose up -d

# Terminal 2: Start development server
cd d:\WEB PROJECTS\execra
npm run dev

# Browser: Open http://localhost:3000
```

### Stopping Everything

```bash
# Ctrl+C in dev server terminal (stops Next.js)

# Then run:
docker-compose down  (stops Docker services)

# OR just click Docker Desktop button to stop it
```

### Restarting Everything

```bash
docker-compose up -d
npm run dev
```

---

## Quick Environment Reference

| Component | Running? | Check Command |
|-----------|----------|---------------|
| Node.js | ✅ | `node --version` |
| npm | ✅ | `npm --version` |
| Docker | ✅ | `docker ps` |
| PostgreSQL | ✅ | `docker ps` (should list) |
| Redis | ✅ | `docker ps` (should list) |
| Dependencies | ✅ | `npm list` (no errors) |
| Migrations | ✅ | `npx prisma studio` (see tables) |
| Dev Server | ✅ | `http://localhost:3000` (page loads) |

---

## Environment Variables Explained

| Variable | What It Does | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Tells Prisma how to connect to PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `NEXTAUTH_SECRET` | Encrypts JWT tokens (security) | `aXFwbzk4aXdoZWp3aXdx...` |
| `NEXTAUTH_URL` | Where NextAuth thinks your site is | `http://localhost:3000` |
| `NODE_ENV` | Tells Next.js this is development | `development` |

---

## Backup: Pre-built Environment File

If you're having issues creating `.env.local`, just copy this:

```env
DATABASE_URL="postgresql://execra:execra_local_pass@localhost:5432/execra"
NEXTAUTH_SECRET="MYAyEzLzI3x7VwLvx5yQ9zR2sT4uV6wX8yZ1aB3cD5eF7gH9iJ0k="
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

⚠️ **Security Note**: Change `NEXTAUTH_SECRET` in production!

---

## Need More Help?

If you're stuck:
1. Check the troubleshooting section above
2. Read `TESTING_GUIDE.md` for more details
3. Check Docker logs: `docker logs execra_postgres`
4. Check Next.js terminal for error messages
5. Open DevTools (F12) in browser and check Console tab

**You've got this!** 🚀
