import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';

export type FindFlatEntityByIdInFlatEntityMapsOrThrowArgs<
  T extends SyncableFlatEntity,
> = {
  flatEntityMaps: FlatEntityMaps<T>;
  flatEntityId: string;
};
export const findFlatEntityByIdInFlatEntityMapsOrThrow = <
  T extends SyncableFlatEntity,
>({
  flatEntityMaps,
  flatEntityId,
}: FindFlatEntityByIdInFlatEntityMapsOrThrowArgs<T>): T => {
  const flatEntity = flatEntityMaps.byId[flatEntityId];

  if (!isDefined(flatEntity)) {
    throw new FlatEntityMapsException(
      t`Could not find flat entity in maps`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return flatEntity;
};
