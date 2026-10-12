import { validate as uuidValidate, version as uuidVersion } from 'uuid';

import { MINIMUM_UNIVERSAL_IDENTIFIER_UUID_VERSION } from '@/application/constants/MinimumUniversalIdentifierUuidVersion';

export const isValidUniversalIdentifier = (identifier: string): boolean =>
  uuidValidate(identifier) &&
  uuidVersion(identifier) >= MINIMUM_UNIVERSAL_IDENTIFIER_UUID_VERSION;
