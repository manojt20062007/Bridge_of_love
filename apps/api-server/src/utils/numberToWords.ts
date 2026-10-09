/**
 * Indian Rupee Number to Words Converter
 * e.g. 5000 -> "Rupees Five Thousand Only"
 */
export function convertNumberToIndianWords(num: number): string {
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
