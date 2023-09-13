export function uuidToBase36(uuid: string) {
  const hexString = uuid.replace(/-/g, '');
  const base10Number = BigInt('0x' + hexString);
  const base36String = base10Number.toString(36);
  return base36String;
}

export function sanitizeColumnName(columnName: string) {
  return columnName.replace(/[^a-zA-Z0-9]/g, '_');
}

export function convertFieldTypeToPostgresType(fieldType: string) {
  switch (fieldType) {
    case 'text':
      return 'text';
    case 'number':
      return 'numeric';
    case 'boolean':
      return 'boolean';
    case 'date':
      return 'timestamp';
    default:
      return 'text';
  }
}
