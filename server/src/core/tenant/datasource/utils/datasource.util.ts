/**
 * Converts a UUID to a base 36 string.
 * This is used to generate the schema name since hyphens from workspace uuid are not allowed in postgres schema names.
 *
 * @param uuid
 * @returns
 */
export const uuidToBase36 = (uuid: string): string => {
  const hexString = uuid.replace(/-/g, '');
  const base10Number = BigInt('0x' + hexString);
  const base36String = base10Number.toString(36);
  return base36String;
};

/**
 * Sanitizes a column name by replacing all non-alphanumeric characters with an underscore.
 * Note: Probablay not the best way to do this, leaving it here as a placeholder for now.
 *
 * @param columnName
 * @returns string
 */
export const sanitizeColumnName = (columnName: string): string =>
  columnName.replace(/[^a-zA-Z0-9]/g, '_');

/**
 * Converts a field type to a postgres type. Field types are defined in the UI.
 *
 * @param fieldType
 * @returns string
 */
export const convertFieldTypeToPostgresType = (fieldType: string): string => {
  switch (fieldType) {
    case 'text':
      return 'text';
    case 'url':
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
};
