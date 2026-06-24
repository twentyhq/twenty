import { Logger } from '@nestjs/common';

import addressparser from 'addressparser';

export type ParsedEmailFromAddress = {
  name: string;
  address: string;
};

export const parseEmailFromAddress = (
  emailFromAddress: string,
): ParsedEmailFromAddress => {
  const logger = new Logger(parseEmailFromAddress.name);

  try {
    const parsedAddresses = addressparser(emailFromAddress);

    if (parsedAddresses.length === 0 || !parsedAddresses[0].address) {
      logger.warn(
        `Could not parse a valid address from EMAIL_FROM_ADDRESS "${emailFromAddress}", using raw value as address`,
      );

      return { name: '', address: emailFromAddress };
    }

    return {
      name: parsedAddresses[0].name ?? '',
      address: parsedAddresses[0].address,
    };
  } catch (error) {
    logger.error(
      `Error parsing EMAIL_FROM_ADDRESS "${emailFromAddress}"`,
      error,
    );

    return { name: '', address: emailFromAddress };
  }
};
