# LoanLens Pro - Build Summary

## What We Built (3-Line Summary)

**1. LoanLens Pro Cashflow Analyzer:** A Next.js 14 full-stack app that parses Indian clinic bank statements (Excel/CSV), auto-categorizes transactions (business loans, clinic income, EMI, rent, tax, vendor payments), and saves them to a Neon PostgreSQL database.

**2. Backend API:** POST endpoint (`/api/parse/upload`) that accepts Excel files, filters transactions (inflows ≥ ₹15,000, outflows ≥ ₹15,000), applies pattern-matching categorization on transaction remarks, computes Indian financial year (Apr–Mar), and saves to `cashflow_entries` table with duplicate prevention.

**3. Database & Features:** PostgreSQL schema with `cashflow_entries` table, automatic date parsing (dd/mm/yyyy → YYYY-MM-DD), amount normalization, financial year tracking, and RESTful API returning JSON with saved count and month summary for cashflow reporting.

---

## Key Files

- `src/app/api/parse/upload/route.ts` - Main API endpoint
- `src/lib/schema.sql` - Database schema (includes `cashflow_entries` table)
- `src/lib/dateUtils.ts` - Date parsing and financial year utilities

## Technologies

- Next.js 14 (App Router, TypeScript)
- Neon PostgreSQL (serverless)
- SheetJS (xlsx) for Excel parsing
- Tailwind CSS (mobile-first UI)

