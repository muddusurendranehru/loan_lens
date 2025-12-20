// Parse date string to YYYY-MM-DD format (handles dd/mm/yyyy and Excel dates)
export function parseDate(dateStr: string): string {
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  // Fallback for Excel dates
  const excelDate = parseFloat(dateStr);
  if (!isNaN(excelDate)) {
    const utc = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    return utc.toISOString().split('T')[0];
  }
  throw new Error(`Invalid date: ${dateStr}`);
}

// Legacy function: Parse date to Date object (for backward compatibility)
export function parseDateToDate(input: string | number | Date): Date | null {
  if (!input) return null;

  // Already a Date
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  // Excel serial number (e.g., 45678)
  if (typeof input === 'number') {
    // Excel epoch starts at 1900-01-01, but has a bug treating 1900 as leap year
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + input * 24 * 60 * 60 * 1000);
    return isNaN(date.getTime()) ? null : date;
  }

  const str = String(input).trim();

  // Try various formats
  const formats = [
    // ISO: 2025-01-12
    /^(\d{4})-(\d{2})-(\d{2})$/,
    // DD-MM-YYYY or DD/MM/YYYY
    /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/,
    // DD-Mon-YYYY (12-Jan-2025)
    /^(\d{1,2})[-\/]([A-Za-z]{3})[-\/](\d{4})$/,
    // Mon DD, YYYY (Jan 12, 2025)
    /^([A-Za-z]{3})\s+(\d{1,2}),?\s+(\d{4})$/,
  ];

  const monthNames: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };

  // ISO format
  let match = str.match(formats[0]);
  if (match) {
    return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  }

  // DD-MM-YYYY
  match = str.match(formats[1]);
  if (match) {
    const day = parseInt(match[1]);
    const month = parseInt(match[2]) - 1;
    const year = parseInt(match[3]);
    return new Date(year, month, day);
  }

  // DD-Mon-YYYY
  match = str.match(formats[2]);
  if (match) {
    const day = parseInt(match[1]);
    const month = monthNames[match[2].toLowerCase()];
    const year = parseInt(match[3]);
    if (month !== undefined) {
      return new Date(year, month, day);
    }
  }

  // Mon DD, YYYY
  match = str.match(formats[3]);
  if (match) {
    const month = monthNames[match[1].toLowerCase()];
    const day = parseInt(match[2]);
    const year = parseInt(match[3]);
    if (month !== undefined) {
      return new Date(year, month, day);
    }
  }

  // Fallback to native parsing
  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? null : fallback;
}

// Format date as YYYY-MM-DD
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Format date for display (DD Mon YYYY)
export function formatDateDisplay(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Calculate Indian Financial Year (Apr-Mar)
// April 2024 to March 2025 = "2024-25"
export function getFinancialYear(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 = Jan, 3 = Apr
  if (month >= 3) {
    return `${year}-${String(year + 1).slice(-2)}`;
  }
  return `${year - 1}-${String(year).slice(-2)}`;
}

// Get month-year string (e.g., "January 2025")
export function getMonthYear(date: Date): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Clean amount string and return number
export function cleanAmount(input: string | number): number {
  if (typeof input === 'number') return input;
  // Remove ₹, Rs, commas, spaces
  const cleaned = String(input).replace(/[₹Rs,\s]/gi, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// Format amount in Indian Rupees
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

