import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type UniversalSyncableFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type FindFlatEntityByIdInFlatEntityMapsOrThrowArgs<
  T extends SyncableFlatEntity | UniversalSyncableFlatEntity,
> = {
  flatEntityMaps: FlatEntityMaps<T>;
  flatEntityId: string;
};
export const findFlatEntityByIdInFlatEntityMapsOrThrow = <
  T extends SyncableFlatEntity | UniversalSyncableFlatEntity,
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
