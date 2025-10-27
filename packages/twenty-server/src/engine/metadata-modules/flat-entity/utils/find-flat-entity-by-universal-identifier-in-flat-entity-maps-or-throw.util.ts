import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import {
    FlatEntityMapsException,
    FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatEntityMapsV2 } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

export type FindFlatEntityByUniversalIdentifierInFlatEntityMapsOrThrowArgs<
  T extends FlatEntity,
> = {
  flatEntityMaps: FlatEntityMapsV2<T>;
  flatEntityUniversalIdentifier: string;
};

export const findFlatEntityByUniversalIdentifierInFlatEntityMapsOrThrow = <
  T extends FlatEntity,
>({
  flatEntityMaps,
  flatEntityUniversalIdentifier,
}: FindFlatEntityByUniversalIdentifierInFlatEntityMapsOrThrowArgs<T>): T => {
  const flatEntity =
    flatEntityMaps.byUniversalIdentifier[flatEntityUniversalIdentifier];

  if (!isDefined(flatEntity)) {
    throw new FlatEntityMapsException(
      t`Could not find flat entity in maps by universal identifier`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return flatEntity;
};

