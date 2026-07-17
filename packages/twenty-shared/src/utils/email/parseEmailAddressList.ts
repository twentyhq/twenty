import addressparser from 'addressparser';

export type ParsedEmailAddress = {
  address: string;
  name: string;
};

export const parseEmailAddressList = (
  rawAddressList: string,
): ParsedEmailAddress[] => {
  try {
    return addressparser(rawAddressList)
      .flatMap((parsedAddress) => parsedAddress.group ?? [parsedAddress])
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
