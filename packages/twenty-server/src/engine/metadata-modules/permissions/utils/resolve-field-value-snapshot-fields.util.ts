import { isDefined } from 'twenty-shared/utils';

import { getJoinColumnNameForRelationField } from 'src/engine/metadata-modules/field-metadata/utils/get-join-column-name-for-relation-field.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { FIELD_VALUE_SNAPSHOT_FIELDS } from 'src/engine/metadata-modules/permissions/constants/field-value-snapshot-fields.constant';
import { type ResolvedFieldValueSnapshotField } from 'src/engine/metadata-modules/permissions/types/resolved-field-value-snapshot-field.type';

export const resolveFieldValueSnapshotFields = ({
  objectMetadataId,
  flatFieldMetadataMaps,
}: {
  objectMetadataId: string;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): ResolvedFieldValueSnapshotField[] =>
  FIELD_VALUE_SNAPSHOT_FIELDS.flatMap(
    ({
      snapshotFieldUniversalIdentifier,
      subjectObjectMetadataIdFieldUniversalIdentifier,
      subjectMorphId,
    }) => {
      const snapshotField = findFlatEntityByUniversalIdentifier({
        universalIdentifier: snapshotFieldUniversalIdentifier,
        flatEntityMaps: flatFieldMetadataMaps,
      });
      const subjectObjectMetadataIdField = findFlatEntityByUniversalIdentifier({
        universalIdentifier: subjectObjectMetadataIdFieldUniversalIdentifier,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (
        snapshotField?.objectMetadataId !== objectMetadataId ||
        !isDefined(subjectObjectMetadataIdField)
      ) {
        return [];
      }

      const subjectJoinColumns = Object.values(
        flatFieldMetadataMaps.byUniversalIdentifier,
      )
        .filter(isDefined)
        .flatMap((flatFieldMetadata) =>
          flatFieldMetadata.objectMetadataId === objectMetadataId &&
          flatFieldMetadata.morphId === subjectMorphId &&
          isDefined(flatFieldMetadata.relationTargetObjectMetadataId)
            ? [
                {
                  joinColumnName:
                    getJoinColumnNameForRelationField(flatFieldMetadata),
                  objectMetadataId:
                    flatFieldMetadata.relationTargetObjectMetadataId,
                },
              ]
            : [],
        );

      return [
        {
          snapshotFieldName: snapshotField.name,
          subjectObjectMetadataIdFieldName: subjectObjectMetadataIdField.name,
          subjectJoinColumns,
        },
      ];
    },
  );
