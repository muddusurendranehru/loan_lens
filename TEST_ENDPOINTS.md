# Testing LoanLens Pro APIs

## 🚀 Start Server

```bash
cd loan_lens
npm run dev
```

Server will start at: **http://localhost:3000**

---

## 📤 Test Upload API

### Using curl (PowerShell):

```powershell
# Test with a file
$file = "24septicici.xlsx"
curl -X POST http://localhost:3000/api/parse/upload `
  -F "file=@$file" `
  -F "sheetName=24septicici.xlsx"
```

### Using Postman:

1. Method: **POST**
2. URL: `http://localhost:3000/api/parse/upload`
3. Body: **form-data**
   - Key: `file`, Type: **File**, Value: Select `24septicici.xlsx`
   - Key: `sheetName`, Type: **Text**, Value: `24septicici.xlsx`

### Expected Response:

```json
{
  "success": true,
  "saved": 7,
  "month": "September 2024"
}
```

---

## 📊 Test Report API

### Using Browser:

Visit: `http://localhost:3000/api/report/cashflow?financial_year=2024-25`

### Using curl:

```powershell
curl http://localhost:3000/api/report/cashflow?financial_year=2024-25
```

### Expected Response:

```json
{
  "success": true,
  "summary": {
    "total_inflow": 250000,
    "total_outflow": 391000
  }
}
```

---

## ✅ Success Criteria

1. Upload API returns `{ "success": true, "saved": 7 }`
2. Report API returns summary with totals
3. Database `cashflow_entries` table has 7 rows after upload
4. No duplicate entries (ON CONFLICT working)

---

## 🐛 Troubleshooting

### "DATABASE_URL not found"
- Check `.env.local` file exists
- Verify `DATABASE_URL` is set correctly

### "Table cashflow_entries does not exist"
- Run schema.sql to create the table
- Or use Neon console to create table

### "Cannot find module '@neondatabase/serverless'"
- Run `npm install` to install dependencies

### Upload returns 0 saved
- Check file format matches expected columns
- Verify amounts meet thresholds (≥ ₹15,000)
- Check transaction remarks for categorization

