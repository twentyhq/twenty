import { FORMULA_FIELD_METADATA_TYPES } from 'twenty-shared/constants';

export const FORMULA_EXPRESSION_DESCRIPTION = [
  'Formula computing the field value from other fields of the same record, read-only for record writes.',
  'Reference fields by name, with dot access for a composite part (amount.amountMicros) or a field of a many-to-one related record (company.name).',
  "Aggregate a one-to-many relation with count(relation, condition?), sum(relation.field, condition?), avg, min and max, e.g. count(tasks), sum(opportunities.amount.amountMicros, opportunities.stage == 'CUSTOMER').",
  'Same operators and functions as validation rules. Load the metadata-building skill for the full syntax and check the expression with validate_formula_expression first.',
].join(' ');

export const FORMULA_CURRENCY_CODE_EXPRESSION_DESCRIPTION =
  'Required for a CURRENCY formula, whose expression is the amount in micros: the currency code as text, e.g. "USD" or amount.currencyCode.';

export const FORMULA_DESCRIPTION = `Makes the field a formula field. Only for types ${FORMULA_FIELD_METADATA_TYPES.join(', ')}. Formula fields cannot be unique or the record label. bindings and evaluation are computed by the server: do not send them. On update, leave it out to keep the formula, or send null to remove it.`;
