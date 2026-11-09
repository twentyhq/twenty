export const VALIDATION_RULE_EXPRESSION_SYNTAX_DESCRIPTION = [
  'Condition that must be true for a record to be saved. When it is false, the write is rejected and the message is shown.',
  'Reference fields by name, as returned by get_field_metadata. Use dot access for a composite field part (amount.amountMicros, name.firstName) and for a field of a many-to-one related record (company.name), never brackets.',
  "Compare select and multi-select fields with option values, e.g. stage == 'CUSTOMER'. Currency amounts are in micros: amount.amountMicros > 1000000000 means more than 1000.",
  'Write text in single quotes. Operators: == != < <= > >= + - * / and or not, and value in [a, b]. now is the date and time of the write; true and false are booleans.',
  'Functions: isDefined(value) is true when the value is set, even to an empty text; isEmpty(value) is true when the value is not set, an empty text, an empty list, or a composite field with every part empty; isNonEmptyString(value); includes(listOrText, value) is true when a multi-select or array contains the value, or a text contains a text, case-sensitive; arrayLength(list).',
  'To require a field, use not isEmpty(field).',
].join(' ');
