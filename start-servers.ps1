# Start HOMA Clinic EBITDA Tracker - Development Server
# Next.js runs both frontend and backend in one server

Write-Host "🚀 Starting HOMA Clinic EBITDA Tracker..." -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:3000/api/*" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start Next.js dev server
npm run dev

