# Testing MonthlyCashflowCard Component

## 🧪 Local Testing Instructions

### 1. Start the Development Server

```bash
cd loan_lens
npm run dev
```

The server will start at `http://localhost:3000`

### 2. Test Routes

#### Option A: Standalone Test Page
Navigate to: **http://localhost:3000/test-cashflow-card**

This shows the component with example data matching the requirements.

#### Option B: Integrated in Dashboard
Navigate to: **http://localhost:3000/dashboard**

1. Enter a financial year (e.g., "2024-25")
2. Select a month (e.g., "October 2024")
3. Click "Generate Report"
4. The card will display using the MonthlyCashflowCard component

### 3. Test Data Format

The component expects:

```typescript
{
  month: "October 2024",
  income: [
    { label: "Business Loan", amount: 200000, description: "L&T Finance" },
    { label: "Clinic Income", amount: 19800, description: "Anjani Foods" },
    { label: "Other Income", amount: 2437286, description: "RTGS from HDFC" }
  ],
  expenses: [
    { label: "EMI", amount: 188522 },
    { label: "Vendor Payments", amount: 437512.70 },
    { label: "Tax", amount: 43950 }
  ],
  netCashflow: 1432062.47
}
```

### 4. Mobile Testing

#### Browser DevTools
1. Open Chrome DevTools (F12)
2. Click device toggle (Ctrl+Shift+M)
3. Select "iPhone SE" (320px width)
4. Test the component layout

#### Test on Real Device
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Access: `http://YOUR_IP:3000/test-cashflow-card`
3. Ensure both devices are on same network

### 5. Expected Output

The card should display:

```
📅 October 2024

💰 INCOME
• Business Loan (L&T Finance) → ₹2,00,000.00
• Clinic Income (Anjani Foods) → ₹19,800.00
• Other Income (RTGS from HDFC) → ₹24,37,286.00

💸 EXPENSES
• EMI → ₹1,88,522.00
• Vendor Payments → ₹4,37,512.70
• Tax → ₹43,950.00

📊 NET CASHFLOW: +₹14,32,062.47
```

### 6. Verify Requirements

✅ **Mobile-first**: Works on 320px width  
✅ **Indian Rupee formatting**: ₹ with commas  
✅ **Color coding**: Green for income, red for expenses  
✅ **Net cashflow**: Large, bold, color-coded  
✅ **Spacing**: Generous padding (p-4)  
✅ **Typography**: Clean, readable font sizes  

### 7. Troubleshooting

**Component not rendering:**
- Check browser console for errors
- Verify imports are correct
- Ensure TypeScript compilation succeeded

**Amounts not formatted:**
- Check browser supports `Intl.NumberFormat`
- Verify amount values are numbers

**Layout issues on mobile:**
- Check Tailwind classes are compiled
- Verify responsive classes are working
- Test with actual device or accurate emulation

### 8. Quick Test Command

```bash
# Start server
npm run dev

# Then open:
# http://localhost:3000/test-cashflow-card
```

