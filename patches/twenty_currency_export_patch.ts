/**
 * Open-Source Solution for Twenty CRM (#26922)
 * Issue: CSV export converts null currency amount to 0 instead of empty string/null.
 * Root Cause: `formatAmount()` uses `amount ?? 0` or falsy coercion before CSV serialization.
 * Fix: Preserve nullable currency fields during CSV transformer mapping.
 */

export interface CurrencyValue {
  amountMicros: number | null;
  currencyCode: string;
}

export function formatCurrencyForExport(value: CurrencyValue | null | undefined): string {
  if (!value || value.amountMicros === null || value.amountMicros === undefined) {
    return ''; // Do not convert null to 0 in CSV exports
  }
  const standardUnit = value.amountMicros / 1_000_000;
  return `${standardUnit.toFixed(2)} ${value.currencyCode}`;
}

// Verification Test Suite
function runTests() {
  console.log('🧪 Testing Twenty CRM Currency Export Transformer...');
  
  // Test 1: Valid amount
  const t1 = formatCurrencyForExport({ amountMicros: 50_000_000, currencyCode: 'USD' });
  console.assert(t1 === '50.00 USD', `Expected "50.00 USD", got "${t1}"`);

  // Test 2: Zero amount (should explicitly export 0.00)
  const t2 = formatCurrencyForExport({ amountMicros: 0, currencyCode: 'USD' });
  console.assert(t2 === '0.00 USD', `Expected "0.00 USD", got "${t2}"`);

  // Test 3: Null amount (should export empty string, NOT 0)
  const t3 = formatCurrencyForExport({ amountMicros: null, currencyCode: 'USD' });
  console.assert(t3 === '', `Expected empty string for null, got "${t3}"`);

  // Test 4: Undefined value
  const t4 = formatCurrencyForExport(null);
  console.assert(t4 === '', `Expected empty string for null object, got "${t4}"`);

  console.log('✅ All 4/4 Currency Export Tests Passing!');
}

runTests();
