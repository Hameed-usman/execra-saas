# Quick-Start Testing Checklist

## 5-Minute Quick Start

Run these commands in order:

```bash
# 1. Start Docker (PostgreSQL + Redis)
docker-compose up -d

# 2. Install dependencies
npm install

# 3. Run database migrations
npx prisma migrate deploy

# 4. Start development server
npm run dev
```

✅ Done! Visit http://localhost:3000

---

## Testing Sequence (Do in Order)

### 1️⃣ View Landing Page (2 min)
- [ ] Go to http://localhost:3000
- [ ] See hero, features, pricing
- [ ] Click "Sign Up" button

### 2️⃣ Test Signup (3 min)
- [ ] Fill form with new email
- [ ] Click "Sign Up"
- [ ] Verify redirects to /onboarding
- [ ] **Check Database**: 
  ```bash
  npx prisma studio
  ```
  - See Tenant created ✓
  - See User created ✓

### 3️⃣ Complete Onboarding (2 min)
- [ ] Fill all onboarding fields
- [ ] Click "Complete Setup"
- [ ] Verify redirects to /dashboard
- [ ] **Check Database**:
  ```bash
  npx prisma studio 
  ```
  - See StartupProfile created ✓

### 4️⃣ Test Logout (1 min)
- [ ] Click user avatar (sidebar)
- [ ] Click logout
- [ ] Verify back to landing page ✓

### 5️⃣ Test Login (2 min)
- [ ] Go to login page
- [ ] Enter same email/password from signup
- [ ] Click "Sign In"
- [ ] Verify redirects to /dashboard ✓

### 6️⃣ Test Wrong Password (1 min)
- [ ] Logout again
- [ ] Go to login
- [ ] Enter wrong password
- [ ] Verify error appears ✓

### 7️⃣ Check API Responses (2 min)
- [ ] Press F12 (DevTools)
- [ ] Go to Network tab
- [ ] Do signup
- [ ] Click `register` in network list
- [ ] Check Response tab shows:
  ```json
  {"success": true, "userId": "..."}
  ```

---

## Docker Troubleshooting

| Problem | Solution |
|---------|----------|
| "Cannot connect to Docker" | Make sure Docker Desktop is running |
| "Port 5432 already in use" | `docker-compose down` then `docker-compose up -d` |
| "Database connection refused" | Check `docker ps` to see if container is running |
| "Permission denied" | Run terminal as Administrator (Windows) |

---

## Key Commands Reference

```bash
# View Docker containers
docker ps

# View Docker logs
docker logs execra_postgres

# Access PostgreSQL directly
docker exec -it execra_postgres psql -U execra -d execra

# View database with UI
npx prisma studio

# Reset database completely
docker-compose down -v
docker-compose up -d
npx prisma migrate deploy

# Start dev server
npm run dev

# Open terminal inside running container
docker exec -it execra_postgres bash
```

---

## Environment Setup

Create `.env.local` file in root directory with:

```env
DATABASE_URL="postgresql://execra:execra_local_pass@localhost:5432/execra"
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

To generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

---

## Expected API Status Codes

| Endpoint | Success | Error |
|----------|---------|-------|
| POST /api/auth/register | 201 | 400, 409, 500 |
| POST /api/auth/[...nextauth] | 200 | 401 |
| POST /api/onboarding | 200 | 401, 500 |

**409** = Email already exists
**401** = Not authenticated
**400** = Missing fields
**500** = Server error

---

## Files to Monitor During Testing

Open these in separate editors:

1. **Terminal 1**: `npm run dev` (keep running)
2. **Terminal 2**: For manual commands
3. **Browser DevTools**: Network + Console tabs (F12)
4. **Prisma Studio**: `npx prisma studio` (verify database)

---

## What Each File Does

| File | Purpose |
|------|---------|
| `app/(auth)/signup/page.tsx` | Signup form UI |
| `app/(auth)/login/page.tsx` | Login form UI |
| `app/api/auth/register/route.ts` | Creates users in DB |
| `app/api/auth/[...nextauth]/route.ts` | Handles login/sessions |
| `app/api/onboarding/route.ts` | Saves company info |
| `lib/auth.ts` | NextAuth configuration |
| `lib/db.ts` | Prisma connection |
| `prisma/schema.prisma` | Database structure |
| `.env.local` | Environment variables (CREATE THIS) |

---

## Success Indicators

✅ **If you can do this**, your app works:

1. Sign up with new email
2. Complete onboarding
3. See dashboard with your name
4. Logout
5. Login with same credentials
6. See dashboard again
7. Logout

**That's a complete test cycle!**

---

## Common Issues Quick Fixes

**"npm: command not found"**
- Install Node.js from nodejs.org

**"Database connection refused"**
- Run: `docker-compose up -d`
- Check: `docker ps`

**"Email already exists error"**
- Use a different email
- Or reset database: `docker-compose down -v && docker-compose up -d && npx prisma migrate deploy`

**".env.local is missing"**
- Create it in project root
- Copy the content from "Environment Setup" section above

**"Stuck on signup page"**
- Check terminal for errors
- Open DevTools → Network tab → Check `register` request
- Look for error in Response

---

## Testing in Different Scenarios

### Scenario A: Fresh Install
```
docker-compose up -d
npm install
npx prisma migrate deploy
npm run dev
# Test signup with new email
```

### Scenario B: Database Already Exists
```
npm run dev
# Continue testing
```

### Scenario C: Something Broke
```
# Stop everything
docker-compose down

# Fresh start
docker-compose up -d
npx prisma migrate deploy
npm run dev
```

---

## Next: Advanced Testing (Optional)

Once basic testing done:
- [ ] Test with multiple users
- [ ] Test concurrent signups
- [ ] Test database under load
- [ ] Test on mobile view (DevTools responsive mode)
- [ ] Test browser tab refresh (session persistence)
- [ ] Test switching between profiles (multi-user)

---

**Need help?** Refer to the full `TESTING_GUIDE.md` for detailed explanations!
