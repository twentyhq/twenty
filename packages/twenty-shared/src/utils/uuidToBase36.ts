export const uuidToBase36 = (uuid: string): string => {
  const hexString = uuid.replace(/-/g, '');
  const base10Number = BigInt('0x' + hexString);
  const base36String = base10Number.toString(36);

  return base36String;
};
