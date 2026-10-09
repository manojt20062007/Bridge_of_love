// ==========================================
// Brand Design Tokens & Palette
// ==========================================
export const BRAND = {
  name: 'Bridge Of Love',
  tagline: 'Connecting compassionate hearts with people in need',
  colors: {
    primary: '#0B1B2B',       // Deep Navy Blue: trust and stability
    primaryLight: '#18314F',
    coral: '#D94A3D',         // Warm Coral: compassion and human care
    coralHover: '#C23A2E',
    coralLight: '#FFF1F0',
    cream: '#FAF8F5',         // Soft Cream background
    creamDark: '#F2ECE4',
    gold: '#C59B27',          // Subtle Gold accents for highlights
    goldLight: '#FEF8E7',
    green: '#15803D',         // Natural Green for verified records
    greenLight: '#ECFDF5',
    textMain: '#1A202C',
    textMuted: '#64748B',
    border: '#E2E8F0',
  },
  fonts: {
    heading: "'Cinzel', 'Playfair Display', 'Lora', serif",
    body: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
  },
};

// ==========================================
// Currency & Indian Formatting Utilities
// ==========================================

/**
 * Format numbers according to Indian Rupee standard: ₹1,50,000.00
 */
export function formatINR(amount: number | string, includeDecimals = true): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0.00';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(num);
}

/**
 * Format compact numbers in Indian system (e.g. 5.2 Lakhs, 1.4 Crores)
 */
export function formatIndianCompact(amount: number): string {
  if (amount >= 10000000) {
    return `${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `${(amount / 100000).toFixed(2)} Lakh`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k`;
  }
  return amount.toString();
}

/**
 * Convert numeric INR amount to standard Indian Words
 * e.g., 5000 -> "Rupees Five Thousand Only"
 */
export function amountInWords(num: number): string {
  if (num === 0) return 'Rupees Zero Only';

  const a = [
    '',
    'One ',
    'Two ',
    'Three ',
    'Four ',
    'Five ',
    'Six ',
    'Seven ',
    'Eight ',
    'Nine ',
    'Ten ',
    'Eleven ',
    'Twelve ',
    'Thirteen ',
    'Fourteen ',
    'Fifteen ',
    'Sixteen ',
    'Seventeen ',
    'Eighteen ',
    'Nineteen ',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    const strN = ('000000000' + n).substr(-9);
    const match = strN.match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!match) return '';

    let out = '';
    const crore = Number(match[1]);
    const lakh = Number(match[2]);
    const thousand = Number(match[3]);
    const hundred = Number(match[4]);
    const remainder = Number(match[5]);

    if (crore > 0) {
      out += (crore > 19 ? b[Math.floor(crore / 10)] + ' ' + a[crore % 10] : a[crore]) + 'Crore ';
    }
    if (lakh > 0) {
      out += (lakh > 19 ? b[Math.floor(lakh / 10)] + ' ' + a[lakh % 10] : a[lakh]) + 'Lakh ';
    }
    if (thousand > 0) {
      out += (thousand > 19 ? b[Math.floor(thousand / 10)] + ' ' + a[thousand % 10] : a[thousand]) + 'Thousand ';
    }
    if (hundred > 0) {
      out += a[hundred] + 'Hundred ';
    }
    if (remainder > 0) {
      if (out !== '') out += 'and ';
      out += remainder > 19 ? b[Math.floor(remainder / 10)] + ' ' + a[remainder % 10] : a[remainder];
    }

    return out.trim();
  }

  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);

  let result = 'Rupees ' + inWords(integerPart);
  if (decimalPart > 0) {
    result += ' and ' + inWords(decimalPart) + 'Paise';
  }
  result += ' Only';

  return result.replace(/\s+/g, ' ');
}

/**
 * Standard date formatter
 */
export function formatDate(dateString: string | Date): string {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Standard date & time formatter
 */
export function formatDateTime(dateString: string | Date): string {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
