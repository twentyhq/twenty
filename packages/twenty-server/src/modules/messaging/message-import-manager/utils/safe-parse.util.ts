import { Logger } from '@nestjs/common';

import addressparser from 'addressparser';

export const safeParseAddress = (
  address: string,
): addressparser.EmailAddress[] | undefined => {
  const logger = new Logger(safeParseAddress.name);

  if (!address) return undefined;
  try {
    return addressparser(address);
  } catch (error) {
    logger.error(`Error parsing address: ${address}`, error);

    return undefined;
  }
};
