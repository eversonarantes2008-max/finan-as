/**
 * Formats a numeric value into Brazilian Real (BRL) string.
 * Example: 1234.5 -> "R$ 1.234,50"
 */
export function formatBRL(value: number): string {
  if (isNaN(value) || value === null || value === undefined) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Parses a string input (e.g. "123,45" or "R$ 1.234,50" or "123.45") into a valid number.
 */
export function parseBRLInput(input: string): number {
  if (!input) return 0;
  // Remove non-numeric characters except comma and dot
  let cleaned = input.replace(/[^0-9.,]/g, '');
  
  if (!cleaned) return 0;

  // If both dot and comma exist, e.g. "1.234,50"
  if (cleaned.includes('.') && cleaned.includes(',')) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    // If only comma exists, replace with dot
    cleaned = cleaned.replace(',', '.');
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formats an unformatted string digit by digit (like banking apps: "123" -> "1,23").
 */
export function formatRawDigitsToBRL(digitsString: string): string {
  const onlyNums = digitsString.replace(/\D/g, '');
  if (!onlyNums) return '0,00';
  const val = parseInt(onlyNums, 10) / 100;
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}
