import { t } from '@lingui/core/macro';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';

// @deprecated Use resolveEntityRelationUniversalIdentifiers instead
export const resolveUniversalIdentifierFromFlatEntityIdOrThrow = <
  T extends AllMetadataName,
>({
  flatEntityMaps,
  flatEntityId,
  metadataName,
}: {
  flatEntityMaps: MetadataFlatEntityMaps<T>;
  flatEntityId: string;
  metadataName: T;
}): string => {
  const flatEntity = findFlatEntityByIdInFlatEntityMaps({
    flatEntityMaps,
    flatEntityId,
  });

  if (!isDefined(flatEntity)) {
    throw new FlatEntityMapsException(
      t`Could not find ${metadataName}`,
      FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
    );
  }

  return flatEntity.universalIdentifier;
};

// @deprecated Use resolveEntityRelationUniversalIdentifiers instead
export const resolveNullableUniversalIdentifierFromFlatEntityId = <
  T extends AllMetadataName,
>({
  flatEntityMaps,
  flatEntityId,
  metadataName,
}: {
  flatEntityMaps: MetadataFlatEntityMaps<T>;
  flatEntityId: string | null | undefined;
  metadataName: T;
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
