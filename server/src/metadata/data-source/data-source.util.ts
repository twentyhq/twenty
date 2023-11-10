/**
 * Converts a UUID to a base 36 string.
 * This is used to generate the schema name since hyphens from workspace uuid are not allowed in postgres schema names.
 *
 * @param uuid
 * @returns
 */
export function uuidToBase36(uuid: string): string {
  let devId = false;

  if (uuid.startsWith('twenty-')) {
    devId = true;
    // Clean dev uuids (twenty-)
    uuid = uuid.replace('twenty-', '');
  }
  const hexString = uuid.replace(/-/g, '');
  const base10Number = BigInt('0x' + hexString);
  const base36String = base10Number.toString(36);

  return `${devId ? 'twenty_' : ''}${base36String}`;
}
