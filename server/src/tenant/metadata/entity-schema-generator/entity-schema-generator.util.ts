/**
 * Sanitizes a column name by replacing all non-alphanumeric characters with an underscore.
 * Note: Probablay not the best way to do this, leaving it here as a placeholder for now.
 *
 * @param columnName
 * @returns string
 */
export function sanitizeColumnName(columnName: string): string {
  return columnName.replace(/[^a-zA-Z0-9]/g, '_');
}

/**
 * Converts a field type to a postgres type. Field types are defined in the UI.
 *
 * @param fieldType
 * @returns string
 */
export function convertFieldTypeToPostgresType(fieldType: string): string {
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
}
