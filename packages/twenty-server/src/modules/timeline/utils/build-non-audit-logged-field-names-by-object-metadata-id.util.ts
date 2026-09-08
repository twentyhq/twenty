import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { isAuditLoggableFieldType } from 'src/engine/metadata-modules/field-metadata/utils/is-audit-loggable-field-type.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

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
    // only an explicit false takes a field out of the timeline. The type rule
    // is not a fallback and deliberately outranks the stored flag: a position
    // diff renders blank whatever the row says, and every row predating the
    // backfill says true, whether because the pods are mid rolling deploy or
    // because run-instance-commands was invoked without --include-slow.
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

    // computeUpdatedFieldsFromDiff appends a join column for the owning side of a
    // relation only, and spells it <name>Id even when settings.joinColumnName
    // diverges, so that is the only alias an event can carry. Excluding the
    // settings-aware spelling would miss the one the event actually has.
    if (
      isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) &&
      flatFieldMetadata.settings?.relationType === RelationType.MANY_TO_ONE
    ) {
      nonAuditLoggedFieldNames.add(
        computeMorphOrRelationFieldJoinColumnName({
          name: flatFieldMetadata.name,
        }),
      );
    }

    nonAuditLoggedFieldNamesByObjectMetadataId.set(
      flatFieldMetadata.objectMetadataId,
      nonAuditLoggedFieldNames,
    );
  }

  return nonAuditLoggedFieldNamesByObjectMetadataId;
};
