/* @license Enterprise */

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { findRelationJoinColumnName } from 'src/engine/permissions/internal/rls/utils/find-relation-join-column-name.util';

export const findLinkedRecordIdsByObjectMetadataId = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  writtenColumns,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  writtenColumns: Record<string, unknown>[];
}): Map<string, Set<string>> => {
  const linkedRecordIdsByObjectMetadataId = new Map<string, Set<string>>();

  for (const flatFieldMetadata of getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  )) {
    if (
      !isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) ||
      flatFieldMetadata.settings?.relationType !== RelationType.MANY_TO_ONE ||
      !isDefined(flatFieldMetadata.relationTargetObjectMetadataId)
    ) {
      continue;
    }

    const joinColumnName = findRelationJoinColumnName(flatFieldMetadata);

    if (!isDefined(joinColumnName)) {
      continue;
    }

    const linkedRecordIds = writtenColumns
      .map((columns) => columns[joinColumnName])
      .filter(isNonEmptyString);

    if (linkedRecordIds.length === 0) {
      continue;
    }

    const recordIds =
      linkedRecordIdsByObjectMetadataId.get(
        flatFieldMetadata.relationTargetObjectMetadataId,
      ) ?? new Set<string>();

    for (const linkedRecordId of linkedRecordIds) {
      recordIds.add(linkedRecordId.toLowerCase());
    }

    linkedRecordIdsByObjectMetadataId.set(
      flatFieldMetadata.relationTargetObjectMetadataId,
      recordIds,
    );
  }

  return linkedRecordIdsByObjectMetadataId;
};
