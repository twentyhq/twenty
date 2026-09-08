import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { isAuditLoggableFieldType } from 'src/engine/metadata-modules/field-metadata/utils/is-audit-loggable-field-type.util';
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
    if (!isDefined(flatFieldMetadata)) {
      continue;
    }

    // A projection cached before the column existed carries no value at all, so
    // only an explicit false takes a field out of the timeline. The type check
    // covers the position rows the backfill has not reached yet, since a slow
    // instance command only runs when the upgrade is given --include-slow.
    const isAuditLogged =
      flatFieldMetadata.isAuditLogged !== false &&
      isAuditLoggableFieldType(flatFieldMetadata.type);

    if (isAuditLogged) {
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
