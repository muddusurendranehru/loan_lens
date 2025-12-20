# PROJECT RULES - LOAN LENS
## Complete Rules Document for Copy/Paste

---

## HEADER INFORMATION
**DR MUDDU SURENDRA NEHRU M.D**  
**PROFESSOR OF MEDICINE, SENIOR PHYSICIAN**  
**WORLD'S FIRST PHYSICIAN TO DEVELOP AI BASED WEB APP FOR NUTRITION, HEALTH METRICS, DRUG TRIALS**  
**Phone: 09963721999**  
**JOIN/COLLABORATE/FRANCHISE/DONATE**  
**Website: www.homahealthcarecenter.in**  
**YouTube: homasurendranehru**  
**Instagram/FB: homahealthcarecenter**

---

## DATABASE RULES

### Database Name
- **IMPORTANT**: Database name is NOT "heart" - it changes based on project
- Current project: **loan_lens**
- Database name comes from project name, NOT hardcoded as "heart"
- Check schema, backend connection string, and URL for actual database name

### Database Connection
- **Database**: Neon PostgreSQL
- **Connection String**: Check `.env.local` file
- **Schema**: Check boolean, null, number types carefully
- **Tables**: Must use UUID as primary key (NOT integer)
- **Example Table Structure**:
```sql
CREATE TABLE table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  -- other fields
);
```

### Database Operations Priority
1. **FIRST**: Check database insert success
2. **SECOND**: Check database fetch success
3. **THEN**: Proceed to next step
4. **NEVER** proceed without verifying insert/fetch success

---

## AUTHENTICATION RULES

### Sign Up Page
- **Fields Required**:
  1. Email (1 field)
  2. Password (1 field)
  3. Confirm Password (1 field)
- **Phone Number**: 
  - Format: +91 or 996 (10 digits total)
  - Make phone number compulsory in sign up page
  - If phone number becomes buggy, make it optional later
  - Indian format: +, +91, or simply 996 (10 numbers)

### Login Page
- **Fields Required**:
  1. Email (1 field)
  2. Password (1 field)
- **After Login**: Auto-redirect to dashboard

### Authentication Flow
- Frontend must communicate with backend
- Middleware must align with frontend and backend
- All three (frontend, middleware, backend) must coincide and align

---

## DEVELOPMENT ORDER (CRITICAL)

### Phase 1: Database (MUST COMPLETE FIRST)
1. Set up Neon PostgreSQL database
2. Check database name (from project, NOT "heart")
3. Create tables with UUID primary keys
4. Test database connection
5. **VERIFY**: Insert success
6. **VERIFY**: Fetch success
7. **ONLY THEN** proceed to backend

### Phase 2: Backend (MUST COMPLETE BEFORE FRONTEND)
1. Set up backend framework
2. Configure Neon database connection
3. Create auth endpoints:
   - POST /api/auth/signup (email, password, confirmPassword)
   - POST /api/auth/login (email, password)
   - POST /api/auth/logout
4. Create data endpoints:
   - POST /api/data (insert)
   - GET /api/data (fetch)
5. Implement authentication middleware
6. Hash passwords (use bcrypt)
7. Generate JWT tokens for sessions
8. **TEST ALL ENDPOINTS THOROUGHLY**
9. **STOP - Do NOT proceed until backend is 100% working**

### Phase 3: Frontend (ONLY AFTER BACKEND SUCCESS)
1. Create Sign Up page (3 fields: email, password, confirm)
2. Create Login page (2 fields: email, password)
3. Create Dashboard page with:
   - Insert form
   - Data display/fetch section
   - Logout button
4. Implement protected routes
5. Store auth tokens properly
6. Handle UUID data types correctly
7. Align all API calls with backend endpoints

---

## NAMING CONVENTIONS (UNIVERSAL APPROACH)

### Universal Names Rule
- Use consistent naming across all files
- Examples: Lakshmi, lakshmi, Lakshmi@, lakshmi_, lakshmig, lakshmiG, lakshmi.G, lakshmi.galla
- **Indian names cause confusion - use universal approach always**
- Database table names must match frontend usage
- If database is "users", frontend must use "users" (NOT "customers" or "user-null")

### Database Table Headings
- Check all content like headings, content
- Be careful with phone numbers - universal like +, +01, only ten digits 996
- Phone: ok, number: ok, so headings also universal

---

## CODE QUALITY RULES

### Development Standards
1. Use TypeScript language
2. Use linters
3. Set up a formatter
4. Test thoroughly
5. Always do dry run
6. Test locally
7. Only if backend success, build frontend

### Architecture Requirements
- Write the science of the app (like Express, React, static)
- Document architecture tree of web app
- Frontend, backend, middleware all must sync
- Database, frontend, middleware all must align

---

## UI/UX RULES

### Design Guidelines
- You are the senior most creative director program manager
- User may copy/paste from Dribbble, etc. sites
- Use beautiful images for UI/UX interface
- Follow common borders, rules, layout, color, font rules
- Should be attractive
- **All frontend in the last step after backend success only**

---

## CRITICAL RULES (DO NOT VIOLATE)

### Rule 1: Don't Destroy Success
- Never break working functionality
- Always verify before making changes

### Rule 2: Alignment
- Always backend, frontend, middleware should align
- All three must coincide

### Rule 3: Universal Names
- Always use universal approach for names
- Avoid confusion with Indian names (Lakshmi variations, etc.)

### Rule 4: Database First
- Database insert, fetch is most important
- After insert fetch success only, build frontend

### Rule 5: User ID Consistency
- Every user will have one ID
- Same ID is used in next table to insert or fetch values
- No mix up (like total cholesterol)
- Use same ID consistently across tables

---

## TESTING CHECKLIST

### Database Testing
- [ ] Database connection successful
- [ ] Table creation successful
- [ ] Insert operation successful
- [ ] Fetch operation successful
- [ ] UUID primary keys working
- [ ] Schema types correct (boolean, null, number)

### Backend Testing
- [ ] All endpoints responding
- [ ] Authentication working
- [ ] Password hashing working
- [ ] JWT tokens generating
- [ ] Middleware protecting routes
- [ ] Database operations working

### Frontend Testing
- [ ] Sign up page working (3 fields)
- [ ] Login page working (2 fields)
- [ ] Dashboard accessible after login
- [ ] Logout working
- [ ] Protected routes working
- [ ] API calls aligned with backend

### Integration Testing
- [ ] Frontend communicates with backend
- [ ] Backend communicates with database
- [ ] Middleware aligns with both
- [ ] User flow: Sign up → Login → Dashboard → Logout

---

## ENVIRONMENT VARIABLES

### Required Variables
```env
DATABASE_URL=postgresql://neondb_owner:password@host/database?sslmode=require
JWT_SECRET=your_jwt_secret_key
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### Optional Variables (Google Sheets API)
```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key\n-----END PRIVATE KEY-----\n"
```

---

## SERVER SETUP

### Next.js (Full-Stack Framework)
- Next.js runs BOTH frontend and backend on ONE server
- Command: `npm run dev`
- Server URL: http://localhost:3000
- Frontend pages: /, /login, /signup, /dashboard
- Backend APIs: /api/auth/*, /api/db/*, /api/parse/*, etc.

### Starting Servers
1. Navigate to project directory
2. Run: `npm run dev`
3. This starts BOTH frontend and backend
4. No need for separate servers

---

## ERROR PREVENTION

### Common Mistakes to Avoid
1. ❌ Using "heart" as database name (use project name)
2. ❌ Proceeding to frontend before backend success
3. ❌ Not verifying insert/fetch operations
4. ❌ Mismatched naming (users vs customers vs user-null)
5. ❌ Not aligning frontend, backend, middleware
6. ❌ Using integer IDs instead of UUID
7. ❌ Not testing locally before deployment

---

## SUCCESS CRITERIA

### Project is Complete When:
- ✅ Database: Insert and fetch both working
- ✅ Backend: All endpoints tested and working
- ✅ Frontend: Sign up, login, dashboard all working
- ✅ Integration: All components communicating successfully
- ✅ User Flow: Sign up → Login → Dashboard → Logout working
- ✅ Security: Authentication and middleware protecting routes
- ✅ Data: UUID handling consistent across all layers

---

## NOTES

- Always check schema, backend connection string, and URL first
- Database name comes from project, NOT hardcoded
- Backend success is mandatory before frontend development
- All components must align and communicate
- Use universal naming conventions
- Test thoroughly at each phase
- Don't destroy working functionality

---

**Last Updated**: Based on project requirements  
**Project**: loan_lens  
**Database**: Neon PostgreSQL  
**Stack**: Next.js (Full-Stack), TypeScript, React

