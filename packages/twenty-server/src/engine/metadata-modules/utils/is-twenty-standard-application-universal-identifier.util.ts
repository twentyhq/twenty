import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

export const isTwentyStandardApplicationUniversalIdentifier = (
  applicationUniversalIdentifier: string | null | undefined,
): boolean =>
  applicationUniversalIdentifier ===
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER;
