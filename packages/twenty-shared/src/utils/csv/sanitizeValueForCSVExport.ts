import { CSV_DANGEROUS_CHARACTERS } from '@/constants/CsvDangerousCharacters';
import { CSV_INJECTION_PREVENTION_ZWJ } from '@/constants/CsvInjectionPreventionZwj';

export const sanitizeValueForCSVExport = (value: unknown): string => {
  if (value == null) return '';

  const stringValue = typeof value === 'string' ? value : String(value);

  if (CSV_DANGEROUS_CHARACTERS.test(stringValue)) {
    return CSV_INJECTION_PREVENTION_ZWJ + stringValue;
  }

  return stringValue;
};
