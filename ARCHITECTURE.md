# Architecture & Docker Deep Dive

A visual guide to understanding your entire system.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        YOUR BROWSER (Client)                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Landing Page │ Signup │ Login │ Onboarding │ Dashboard (UI)  │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTP Requests
                               │ JSON Data
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│              Next.js Server (localhost:3000)                        │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Next.js App                                                  │ │
│  │  ├─ app/page.tsx (landing page)                             │ │
│  │  ├─ app/(auth)/signup/page.tsx (signup UI)                 │ │
│  │  ├─ app/(auth)/login/page.tsx (login UI)                   │ │
│  │  ├─ app/(dashboard)/dashboard/page.tsx (dashboard UI)      │ │
│  │  └─ ROUTES:                                                │ │
│  │     ├─ POST /api/auth/register → Create user              │ │
│  │     ├─ POST /api/auth/[...nextauth] → Login/Session       │ │
│  │     └─ POST /api/onboarding → Save company info           │ │
│  │                                                             │ │
│  │  NextAuth v5 ──┐                                          │ │
│  │  (Auth Logic)   │                                          │ │
│  │                 │                                          │ │
│  │  JWT Tokens, Sessions, Credentials verification          │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Prisma ORM (Database Client)                                 │ │
│  │  - Converts JavaScript code to SQL                            │ │
│  │  - Handles database queries                                   │ │
│  │  - Type-safe database operations                              │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ SQL Queries
                               │ Connection: localhost:5432
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Docker Container Network                         │
│  ┌──────────────────────────────────┬──────────────────────────────┐│
│  │  PostgreSQL Container            │  Redis Container           ││
│  │  Port: 5432                      │  Port: 6379                ││
│  │  Database: execra                │  Purpose: Caching (future) ││
│  │  User: execra                    │                            ││
│  │  Password: execra_local_pass     │  Status: Running ✓         ││
│  │                                  │                            ││
│  │  Tables:                         │                            ││
│  │  ├─ Tenant (companies)           │                            ││
│  │  ├─ User (accounts)              │                            ││
│  │  └─ StartupProfile (company data)│                            ││
│  │                                  │                            ││
│  │  Status: Running ✓               │                            ││
│  │  Volume: postgres_data/          │                            ││
│  │  (Data persists after restart)   │                            ││
│  └──────────────────────────────────┴──────────────────────────────┘│
│                                                                     │
│  Isolated Network: Container can't access host without port mapping │
└─────────────────────────────────────────────────────────────────────┘
```

---

## How Data Flows (Example: Signup)

```
1. User fills signup form
   ├─ Name: John
   ├─ Email: john@example.com
   ├─ Password: SecurePass123!
   └─ Company: My Startup

2. CLICK "Sign Up" Button
   │
   ├─ Frontend sends POST to /api/auth/register
   │  └─ Body: JSON with form data
   │
   ▼

3. Backend receives in /api/auth/register/route.ts
   │
   ├─ Validates: All fields present? ✓
   ├─ Hash password: SecurePass123! → $2a$12$xyz... (bcryptjs)
   ├─ Create Tenant: INSERT INTO Tenant VALUES (...)
   │  └─ Returns: Tenant ID (unique identifier)
   │
   ├─ Create User: INSERT INTO User VALUES (...)
   │  └─ Stores: email, hashed_password, name, tenant_id
   │
   ├─ Database (PostgreSQL) executes SQL:
   │  └─ Both INSERT queries complete
   │
   ▼

4. Backend responds to frontend
   ├─ Status: 201 (Created)
   └─ Body: { success: true, userId: "abc-123" }

5. Frontend receives response
   ├─ If success: Redirect to /onboarding
   └─ If error: Show error message

6. User navigates to /onboarding
   └─ NextAuth verifies they just signed up ✓
```

---

## How Data Flows (Example: Login)

```
1. User fills login form
   ├─ Email: john@example.com
   └─ Password: SecurePass123!

2. CLICK "Sign In" Button
   │
   ├─ Frontend calls signIn() from NextAuth
   │
   ▼

3. NextAuth middleware runs
   │
   ├─ Calls authorize() function in /lib/auth.ts
   │
   ├─ Query database: SELECT * FROM User WHERE email = 'john@example.com'
   │  ├─ If not found: Error "Invalid credentials"
   │  └─ If found: Continue to next step
   │
   ├─ Compare passwords using bcryptjs:
   │  ├─ Stored hash: $2a$12$xyz...
   │  ├─ User entered: SecurePass123!
   │  ├─ bcryptjs.compare() → true or false
   │  ├─ If false: Error "Invalid credentials"
   │  └─ If true: Continue to next step
   │
   ├─ Create JWT token containing:
   │  ├─ user.id (from database)
   │  ├─ user.tenantId (from database)
   │  ├─ expirationTime (30 days from now)
   │  └─ Encrypted with NEXTAUTH_SECRET
   │
   ├─ Store JWT in httpOnly cookie (automatic)
   │  └─ Secure: Can't be accessed by JavaScript
   │  └─ Persistent: Survives page refreshes
   │
   ▼

4. NextAuth responds
   └─ Status: 200 (OK) with session data

5. Frontend receives response
   ├─ If success: Navigate to /dashboard
   └─ If error: Show "Invalid email or password"

6. Browser stores JWT token in cookies
   └─ Automatically sent with every request to /api/

7. User navigates to /dashboard
   ├─ Server calls await auth()
   ├─ NextAuth checks JWT token in cookies
   ├─ If valid: Loads dashboard with user data
   └─ If invalid: Redirects to /login
```

---

## Database Schema Visualization

```
┌──────────────────────────────┐
│         TENANT (Company)     │
├──────────────────────────────┤
│ id        (Primary Key)      │
│ name      (string)           │
│ createdAt (timestamp)        │
└──────────────────────────────┘
           │
           │ 1 Tenant has many Users
           │
           ▼
┌──────────────────────────────┐
│           USER (Account)     │
├──────────────────────────────┤
│ id           (Primary Key)   │
│ email        (unique string) │
│ passwordHash (hashed)        │
│ name         (string)        │
│ tenantId     (Foreign Key)───┼──→ Links to Tenant
│ createdAt    (timestamp)     │
└──────────────────────────────┘
           │
           │ 1 User is part of 1 Tenant
           │
           ▼
┌──────────────────────────────┐
│    STARTUPPROFILE (Company   │
│    Details)                  │
├──────────────────────────────┤
│ id          (Primary Key)    │
│ tenantId    (Foreign Key)────┼──→ Links to Tenant
│ industry    (string)         │
│ stage       (string)         │
│ teamSize    (number)         │
│ description (text)           │
│ goals       (text)           │
│ competitors (text)           │
│ tools       (JSON array)     │
│ createdAt   (timestamp)      │
└──────────────────────────────┘
```

**Explanation**:
- 1 Tenant = 1 Company
- 1 Company has 1+ Users
- 1 Company has 1 StartupProfile
- All linked by Foreign Keys (tenantId)

---

## Docker Deep Dive

### What Is Docker?

**Simple analogy**:
```
Without Docker:
- Developer machine: Uses PostgreSQL 16
- Test machine: Uses PostgreSQL 15 (different version!)
- Production: Uses PostgreSQL 17 (different again!)
- Result: "Works on my machine" problems ❌

With Docker:
- Developer: PostgreSQL 16 in container
- Test: PostgreSQL 16 in container
- Production: PostgreSQL 16 in container
- Result: Identical environment everywhere ✓
```

### Your docker-compose.yml

```yaml
version: '3.8'                    # Docker Compose format version

services:                         # Define services
  postgres:                       # PostgreSQL service
    image: postgres:16            # Use official PostgreSQL image v16
    container_name: execra_postgres  # Container name
    restart: always               # Restart if crashes
    
    environment:                  # Pass variables to container
      POSTGRES_DB: execra         # Database name inside container
      POSTGRES_USER: execra       # Admin username
      POSTGRES_PASSWORD: execra_local_pass  # Admin password
    
    ports:                        # Port mapping
      - "5432:5432"              # Host:Container
                                 # 5432 on host → 5432 in container
    
    volumes:                      # File system mapping
      - postgres_data:/var/lib/postgresql/data
                                 # host_volume:container_path
                                 # Data persists on host, survives restarts

  redis:                          # Redis service (cache)
    image: redis:7                # Use official Redis image v7
    container_name: execra_redis
    restart: always
    ports:
      - "6379:6379"              # Port mapping

volumes:                          # Define volumes used by services
  postgres_data:                  # Volume for database persistence
```

### Docker Commands Explained

```bash
# Start containers in background
docker-compose up -d
# -d = detached (background)
# Reads docker-compose.yml and starts services

# View running containers
docker ps
# Shows container name, status, port mapping, etc.

# View logs from a container
docker logs execra_postgres
# Shows what's happening inside the container

# Stop containers
docker-compose down
# Stops services but keeps volumes (data persists)

# Stop containers AND delete volumes (⚠️ deletes data!)
docker-compose down -v
# -v = volumes
# Use only when you want to reset database completely

# Execute command inside container
docker exec -it execra_postgres psql -U execra -d execra
# -it = interactive terminal
# Lets you run commands inside running container

# Access PostgreSQL directly
# Once inside container:
\dt                    # List tables
SELECT * FROM "User";  # Query users
\q                     # Exit
```

---

## Port Mapping Explained

```
Your Machine (localhost)      Docker Container
┌─────────────────────────┐   ┌──────────────────┐
│ 5432 ←──────────────────┼──→ 5432 PostgreSQL  │
│ (accepts connections)   │   (port inside)    │
└─────────────────────────┘   └──────────────────┘
      host machine              isolated container

Connection string: postgresql://user:pass@localhost:5432/db
                                            ↑      ↑
                                          host   host port
```

When you connect to `localhost:5432`:
1. Your app connects to port 5432 on your machine
2. Docker forwards that connection to port 5432 in the container
3. PostgreSQL inside container receives it

---

## Volume Persistence Explained

```
Without volumes:
┌──────────────────────────┐
│ Running PostgreSQL ✓     │
│ Database data in memory  │
└──────────────┬───────────┘
               │
        docker-compose down
               │
               ▼
        ✗ ALL DATA LOST


With volumes:
┌──────────────────────────┐   ┌──────────────────────┐
│ Running PostgreSQL ✓     │   │ Your Hard Drive      │
│ Database data ←────────→ ├──→ postgres_data/      │
│ in memory               │   │ (persistent copy)    │
└──────────────┬──────────┘   └──────────────────────┘
               │
        docker-compose down
               │
               ▼
        ✓ DATA SAVED on disk
        
Next time:
┌──────────────────────────┐   ┌──────────────────────┐
│ Starting PostgreSQL      │   │ Your Hard Drive      │
│ ←─────── load from ←──────┼──← postgres_data/     │
│ Database restores ✓      │   │ (recovered data)     │
└──────────────────────────┘   └──────────────────────┘
```

This means:
- ✓ Data survives container restarts
- ✓ Data survives `docker-compose down`
- ✓ Data persists between test runs
- ✗ Only deleted if you use `docker-compose down -v`

---

## Network Communication Diagram

```
Your Application
    │
    │ "I need to connect to: localhost:5432"
    │
    ▼
┌────────────────────────────┐
│ Port 5432 on your machine  │
│ (listening for connections)│
└────────────────┬───────────┘
                 │
        Docker forwards
                 │
    ┌────────────▼───────────┐
    │   Docker Bridge Network│
    │  (special network)     │
    └────────────┬───────────┘
                 │
                 │ Port 5432 inside
                 │
    ┌────────────▼───────────────────┐
    │ PostgreSQL Container           │
    │ Receives connection, processes │
    │ Returns data back through same  │
    │ port to your application        │
    └────────────────────────────────┘
```

---

## Troubleshooting in Docker Context

### "Can't connect to database"

```
Check: Is Docker running?
docker ps
↓
No? Start Docker Desktop or run: docker-compose up -d
 Yes? Check port 5432 is mapped correctly: docker ps (should show 5432:5432)
```

### "Port already in use"

```
Something else is using port 5432

Solution 1: Change port in docker-compose.yml
  ports:
    - "5433:5432"  # ← Changed from 5432 to 5433
  Then update DATABASE_URL in .env.local

Solution 2: Kill whatever's using port 5432
  Windows: netstat -ano | findstr :5432 → taskkill /pid [PID] /f
  Mac/Linux: lsof -ti:5432 | xargs kill -9

Solution 3: Stop other Docker containers
  docker ps (find other containers)
  docker stop [container-id]
```

### "Data disappeared after restart"

```
Check: Did you use docker-compose down -v?
  -v flag deletes volumes (data!)

Solution: Restore from backup or recreate
  docker-compose up -d
  npx prisma migrate deploy
```

---

## Security Notes

### Why Hashed Passwords?

```
BAD - Storing plaintext:
Database hacked → Attacker steal password → Access any site user registered
  user: john@example.com
  password: SecurePass123!  ← Exposed! ✗

GOOD - Storing hash:
Database hacked → Attacker sees hash → Can't reverse it back to password
  user: john@example.com
  password: $2a$12$abc123xyz... ← Not the real password ✓
  
bcryptjs does this hashing:
- SHA256: Fast but weak (not used here)
- bcryptjs: Slow by design (prevents brute force)
  - To match password takes ~100ms
  - Attacker trying 1 million passwords = 100,000 seconds = 27+ hours ✗
```

### Why httpOnly Cookies?

```
Session token stored in httpOnly cookie:
- Automatic: Browser sends with every request to backend
- Secure: JavaScript can't access it (prevents XSS attacks)
- Encrypted: Encrypted with NEXTAUTH_SECRET
```

### Why JWT Tokens?

```
Traditional Session (your current setup):
Server stores session data → Takes database space
But with JWT:
  Token = encrypted data (id, tenantId, expiration)
  Server just verifies signature, doesn't need to store
  = Scalable, no database reads needed for auth
```

---

## Environment Variables Security

### Public (Safe to Commit)
```env
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### Secret (Never Commit - use .env.local)
```env
DATABASE_URL="postgresql://..."  ← Database credentials
NEXTAUTH_SECRET="..."             ← Encryption key
```

### Vercel/Production
On production hosting:
- Set variables in hosting dashboard (Vercel, AWS, etc.)
- Never commit `.env.local` to git
- Use `.gitignore` to exclude `.env*`

---

## Summary: How It All Works Together

```
1. User Action (Browser)
   "I want to sign up"
   ↓
2. Frontend (React)
   Collect form data, show loading state
   ↓
3. Next.js API Route
   Receive data, validate, hash password
   ↓
4. Prisma ORM
   Convert to SQL: INSERT INTO Tenant...
   ↓
5. Docker Container (PostgreSQL)
   Execute SQL, save to postgres_data volume
   ↓
6. Response Back
   Success → Frontend redirects to onboarding
   ↓
7. Data Persistence
   Data saved on hard drive (volume)
   Survives container restart ✓
```

---

## Next: What You Can Extend

Now that you understand the architecture, you can:
- [ ] Add email verification (send email on signup)
- [ ] Add password reset flow
- [ ] Add more API endpoints
- [ ] Add real-time features (WebSockets)
- [ ] Add caching layer (Redis)
- [ ] Add background jobs (email sending)
- [ ] Deploy to production (Vercel + PostgreSQL service)

---

## Questions You Should Be Able to Answer

- [ ] Why do we use Docker instead of local PostgreSQL?
- [ ] What's the difference between port mapping and volumes?
- [ ] Why must passwords be hashed before storing?
- [ ] How does JWT token work compared to sessions?
- [ ] What's a Foreign Key and why do we need tenantId?
- [ ] Why is .env.local in .gitignore?
- [ ] How does Prisma convert code to SQL?
- [ ] What happens when you run docker-compose down?

If you can explain these → You understand the architecture! 🎉

---

## Emergency Commands

```bash
# Everything broke? Start fresh:
docker-compose down -v              # Stop and delete everything
docker-compose up -d                # Start fresh
npx prisma migrate deploy           # Recreate database
npm run dev                         # Start dev server

# Database corrupted?
docker-compose restart execra_postgres

# Need to see actual SQL being executed?
npx prisma db execute --stdin < query.sql

# Check database connection:
npx prisma migrate status

# Drop all tables (careful!):
npx prisma migrate reset
```

---

**You now understand your entire system!** 🚀
