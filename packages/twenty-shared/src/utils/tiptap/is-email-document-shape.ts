export const isEmailDocumentShape = (
  value: unknown,
): value is { type: 'doc' } =>
  typeof value === 'object' &&
  value !== null &&
  'type' in value &&
  value.type === 'doc';
