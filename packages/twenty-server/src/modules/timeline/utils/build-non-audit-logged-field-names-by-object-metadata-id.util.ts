import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

export const buildNonAuditLoggedFieldNamesByObjectMetadataId = (
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>,
): Map<string, Set<string>> => {
  const nonAuditLoggedFieldNamesByObjectMetadataId = new Map<
    string,
    Set<string>
  >();

  for (const flatFieldMetadata of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  )) {
    // A projection cached before the column existed carries no value at all, so
    // only an explicit false takes a field out of the timeline.
    if (
      !isDefined(flatFieldMetadata) ||
      flatFieldMetadata.isAuditLogged !== false
    ) {
      continue;
    }

    const nonAuditLoggedFieldNames =
      nonAuditLoggedFieldNamesByObjectMetadataId.get(
        flatFieldMetadata.objectMetadataId,
      ) ?? new Set<string>();

    nonAuditLoggedFieldNames.add(flatFieldMetadata.name);
    nonAuditLoggedFieldNamesByObjectMetadataId.set(
      flatFieldMetadata.objectMetadataId,
      nonAuditLoggedFieldNames,
    );
  }

  return nonAuditLoggedFieldNamesByObjectMetadataId;
};
