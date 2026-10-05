import { VALIDATION_RULE_FIELD_SYMBOL_PREFIX } from '@/constants/ValidationRuleFieldSymbolPrefix';

export const isValidationRuleFieldSymbol = (segment: string): boolean =>
  segment.startsWith(VALIDATION_RULE_FIELD_SYMBOL_PREFIX);
