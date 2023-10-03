/**
 * Generate a column name from a field name removing unsupported characters.
 *
 * @param name string
 * @returns string
 */
export function generateColumnName(name: string): string {
  return name.toLowerCase().replace(/ /g, '_');
}
