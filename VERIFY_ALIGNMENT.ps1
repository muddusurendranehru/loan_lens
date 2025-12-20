# Step-by-Step Backend/Frontend/Database Alignment Check
# PowerShell version

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STEP-BY-STEP ALIGNMENT VERIFICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check Environment Variables
Write-Host "STEP 1: Checking Environment Variables" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    $hasDatabaseUrl = $envContent -match "DATABASE_URL="
    $hasNextAuthSecret = $envContent -match "NEXTAUTH_SECRET="
    $hasNextAuthUrl = $envContent -match "NEXTAUTH_URL="
    
    Write-Host "✅ .env.local exists" -ForegroundColor Green
    Write-Host "   DATABASE_URL: $(if ($hasDatabaseUrl) { '✅ Found' } else { '❌ Missing' })" -ForegroundColor $(if ($hasDatabaseUrl) { 'Green' } else { 'Red' })
    Write-Host "   NEXTAUTH_SECRET: $(if ($hasNextAuthSecret) { '✅ Found' } else { '❌ Missing' })" -ForegroundColor $(if ($hasNextAuthSecret) { 'Green' } else { 'Red' })
    Write-Host "   NEXTAUTH_URL: $(if ($hasNextAuthUrl) { '✅ Found' } else { '❌ Missing' })" -ForegroundColor $(if ($hasNextAuthUrl) { 'Green' } else { 'Red' })
    
    if (-not $hasDatabaseUrl -or -not $hasNextAuthSecret -or -not $hasNextAuthUrl) {
        Write-Host "❌ Missing required environment variables!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ .env.local not found!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Check File Structure
Write-Host "STEP 2: Checking File Structure" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$requiredFiles = @(
    "src/lib/db.ts",
    "src/lib/schema.sql",
    "src/app/api/auth/signup/route.ts",
    "src/app/api/auth/[...nextauth]/route.ts",
    "src/app/signup/page.tsx",
    "src/app/login/page.tsx",
    "src/app/dashboard/page.tsx",
    "package.json"
)

foreach ($file in $requiredFiles) {
    $exists = Test-Path $file
    $status = if ($exists) { "✅" } else { "❌" }
    $color = if ($exists) { "Green" } else { "Red" }
    Write-Host "$status $file" -ForegroundColor $color
}
Write-Host ""

# Step 3: Check API Routes
Write-Host "STEP 3: Checking API Routes" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$signupRoutePath = "src/app/api/auth/signup/route.ts"
if (Test-Path $signupRoutePath) {
    $signupCode = Get-Content $signupRoutePath -Raw
    $usesBcrypt = $signupCode -match "bcrypt"
    $usesSql = $signupCode -match "sql`"
    $insertsEmailPassword = $signupCode -match "INSERT INTO users \(email, password\)"
    
    Write-Host "Signup API Route:" -ForegroundColor Cyan
    Write-Host "   Uses bcrypt: $(if ($usesBcrypt) { '✅' } else { '❌' })" -ForegroundColor $(if ($usesBcrypt) { 'Green' } else { 'Red' })
    Write-Host "   Uses sql: $(if ($usesSql) { '✅' } else { '❌' })" -ForegroundColor $(if ($usesSql) { 'Green' } else { 'Red' })
    Write-Host "   Inserts email/password: $(if ($insertsEmailPassword) { '✅' } else { '❌' })" -ForegroundColor $(if ($insertsEmailPassword) { 'Green' } else { 'Red' })
    
    $insertsPhone = $signupCode -match "phone"
    if ($insertsPhone) {
        Write-Host "   ⚠️  WARNING: Code inserts phone column" -ForegroundColor Yellow
    }
}
Write-Host ""

# Step 4: Check Frontend Alignment
Write-Host "STEP 4: Checking Frontend Alignment" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

$signupPagePath = "src/app/signup/page.tsx"
if (Test-Path $signupPagePath) {
    $signupPageCode = Get-Content $signupPagePath -Raw
    $hasEmailField = $signupPageCode -match 'type="email"'
    $hasPasswordField = $signupPageCode -match 'type="password"'
    $callsSignupAPI = $signupPagePath -match "/api/auth/signup"
    
    Write-Host "Signup Page:" -ForegroundColor Cyan
    Write-Host "   Email field: $(if ($hasEmailField) { '✅' } else { '❌' })" -ForegroundColor $(if ($hasEmailField) { 'Green' } else { 'Red' })
    Write-Host "   Password field: $(if ($hasPasswordField) { '✅' } else { '❌' })" -ForegroundColor $(if ($hasPasswordField) { 'Green' } else { 'Red' })
    Write-Host "   Calls /api/auth/signup: $(if ($callsSignupAPI) { '✅' } else { '❌' })" -ForegroundColor $(if ($callsSignupAPI) { 'Green' } else { 'Red' })
}

$loginPagePath = "src/app/login/page.tsx"
if (Test-Path $loginPagePath) {
    $loginPageCode = Get-Content $loginPagePath -Raw
    $usesNextAuth = $loginPageCode -match "next-auth/react"
    $redirectsToDashboard = $loginPageCode -match "/dashboard"
    
    Write-Host "`nLogin Page:" -ForegroundColor Cyan
    Write-Host "   Uses NextAuth: $(if ($usesNextAuth) { '✅' } else { '❌' })" -ForegroundColor $(if ($usesNextAuth) { 'Green' } else { 'Red' })
    Write-Host "   Redirects to dashboard: $(if ($redirectsToDashboard) { '✅' } else { '❌' })" -ForegroundColor $(if ($redirectsToDashboard) { 'Green' } else { 'Red' })
}
Write-Host ""

# Step 5: Check Dependencies
Write-Host "STEP 5: Checking Dependencies" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

if (Test-Path "package.json") {
    $pkg = Get-Content "package.json" | ConvertFrom-Json
    $allDeps = @{}
    if ($pkg.dependencies) { $pkg.dependencies.PSObject.Properties | ForEach-Object { $allDeps[$_.Name] = $_.Value } }
    if ($pkg.devDependencies) { $pkg.devDependencies.PSObject.Properties | ForEach-Object { $allDeps[$_.Name] = $_.Value } }
    
    $requiredDeps = @{
        "@neondatabase/serverless" = "Database connection"
        "bcryptjs" = "Password hashing"
        "next-auth" = "Authentication"
        "next" = "Framework"
        "react" = "UI library"
    }
    
    foreach ($dep in $requiredDeps.Keys) {
        $exists = $allDeps.ContainsKey($dep)
        $status = if ($exists) { "✅" } else { "❌" }
        $color = if ($exists) { "Green" } else { "Red" }
        Write-Host "$status $dep - $($requiredDeps[$dep])" -ForegroundColor $color
    }
}
Write-Host ""

# Step 6: Check Database (requires Node.js)
Write-Host "STEP 6: Checking Database Connection" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "Running Node.js verification script..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path "VERIFY_ALIGNMENT.js") {
    node VERIFY_ALIGNMENT.js
} else {
    Write-Host "⚠️  VERIFY_ALIGNMENT.js not found" -ForegroundColor Yellow
    Write-Host "   Run: node ensure-database.js to check database" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "VERIFICATION COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

