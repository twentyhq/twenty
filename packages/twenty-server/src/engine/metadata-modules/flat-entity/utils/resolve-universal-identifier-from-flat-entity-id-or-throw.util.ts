import { t } from '@lingui/core/macro';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';

export const resolveUniversalIdentifierFromFlatEntityIdOrThrow = <
  T extends SyncableFlatEntity,
>({
  flatEntityMaps,
  flatEntityId,
  metadataName,
}: {
  flatEntityMaps: FlatEntityMaps<T>;
  flatEntityId: string;
  metadataName: AllMetadataName;
}): string => {
  const flatEntity = findFlatEntityByIdInFlatEntityMaps({
    flatEntityMaps,
    flatEntityId,
  });

  if (!isDefined(flatEntity)) {
    throw new FlatEntityMapsException(
      t`Could not find ${metadataName} with id ${flatEntityId}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return flatEntity.universalIdentifier;
};

export const resolveNullableUniversalIdentifierFromFlatEntityId = <
  T extends SyncableFlatEntity,
>({
  flatEntityMaps,
  flatEntityId,
  metadataName,
}: {
  flatEntityMaps: FlatEntityMaps<T>;
  flatEntityId: string | null | undefined;
  metadataName: AllMetadataName;
}): string | null => {
  if (!isDefined(flatEntityId)) {
    return null;
  }

  return resolveUniversalIdentifierFromFlatEntityIdOrThrow({
    flatEntityMaps,
    flatEntityId,
    metadataName,
  });
};
