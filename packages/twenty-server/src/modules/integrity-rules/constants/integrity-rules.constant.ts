import { COMPANY_INTEGRITY_RULES } from 'src/modules/integrity-rules/constants/company-integrity-rules.constant';
import { type IntegrityRule } from 'src/modules/integrity-rules/types/integrity-rule.type';

export const INTEGRITY_RULES: IntegrityRule[] = [...COMPANY_INTEGRITY_RULES];
