import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type UniversalSyncableFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';

export const findFlatEntityByUniversalIdentifierOrThrow = <
  T extends SyncableFlatEntity | UniversalSyncableFlatEntity,
>({
  flatEntityMaps,
  universalIdentifier,
}: {
  flatEntityMaps: UniversalFlatEntityMaps<T>;
  universalIdentifier: string;
}): T => {
  const flatEntity = findFlatEntityByUniversalIdentifier({
    flatEntityMaps,
    universalIdentifier,
  });

  if (!isDefined(flatEntity)) {
    throw new FlatEntityMapsException(
      `Could not find flat entity with universal identifier ${universalIdentifier}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return flatEntity;
};
