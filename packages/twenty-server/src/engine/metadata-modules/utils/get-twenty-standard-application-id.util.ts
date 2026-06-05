import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';

export const getTwentyStandardApplicationId = (
  flatApplicationMaps: FlatApplicationCacheMaps,
): string | undefined =>
  flatApplicationMaps.idByUniversalIdentifier[
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
  ];
