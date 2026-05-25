import { Logger } from '@nestjs/common';

import addressparser from 'addressparser';

export const safeParseEmailAddressAddress = (
  address: string,
): string | undefined => {
  const logger = new Logger(safeParseEmailAddressAddress.name);

  try {
    return addressparser(address)[0].address;
  } catch (error) {
    logger.error(`Error parsing address: ${address}`, error);

    return undefined;
  }
};
