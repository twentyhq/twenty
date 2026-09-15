import addressparser from 'addressparser';

export type ParsedEmailAddress = {
  address: string;
  name: string;
};

type AddressparserEntry = ReturnType<typeof addressparser>[number];

const flattenEmailAddressGroups = (
  parsedAddresses: AddressparserEntry[],
): AddressparserEntry[] =>
  parsedAddresses.flatMap((parsedAddress) =>
    parsedAddress.group
      ? flattenEmailAddressGroups(parsedAddress.group)
      : [parsedAddress],
  );

export const parseEmailAddressList = (
  rawAddressList: string,
): ParsedEmailAddress[] => {
  try {
    return flattenEmailAddressGroups(addressparser(rawAddressList))
      .map((parsedAddress) => ({
        address: parsedAddress.address ?? '',
        name: (parsedAddress.name ?? '').trim(),
      }))
      .filter(
        (parsedAddress) =>
          parsedAddress.address.length > 0 || parsedAddress.name.length > 0,
      );
  } catch {
    return [];
  }
};
