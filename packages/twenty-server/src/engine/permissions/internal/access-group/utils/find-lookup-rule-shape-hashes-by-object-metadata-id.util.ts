/* @license Enterprise */

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type RecordAccessGroupSQLConditionMetadataMaps } from 'src/engine/permissions/internal/access-group/types/record-access-group-sql-condition-metadata-maps.type';
import { findAccessGroupValueLookups } from 'src/engine/permissions/internal/access-group/utils/find-access-group-value-lookups.util';

export const findLookupRuleShapeHashesByObjectMetadataId = ({
  objectMetadataIds,
  metadataMaps,
}: {
  objectMetadataIds: string[];
  metadataMaps: RecordAccessGroupSQLConditionMetadataMaps;
}): Map<string, Set<string>> =>
  new Map(
    [...new Set(objectMetadataIds)].map((objectMetadataId) => [
      objectMetadataId,
      new Set(
        findAccessGroupValueLookups({
          flatObjectMetadata: findFlatEntityByIdInFlatEntityMapsOrThrow({
            flatEntityId: objectMetadataId,
            flatEntityMaps: metadataMaps.flatObjectMetadataMaps,
          }),
          metadataMaps,
        }).map(({ ruleShapeHash }) => ruleShapeHash),
      ),
    ]),
  );
