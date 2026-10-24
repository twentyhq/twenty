import { isDefined } from 'twenty-shared/utils';

import { getJoinColumnNameForRelationField } from 'src/engine/metadata-modules/field-metadata/utils/get-join-column-name-for-relation-field.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { FIELD_VALUE_SNAPSHOT_FIELDS } from 'src/engine/metadata-modules/permissions/constants/field-value-snapshot-fields.constant';
import { type ResolvedFieldValueSnapshotField } from 'src/engine/metadata-modules/permissions/types/resolved-field-value-snapshot-field.type';

export const resolveFieldValueSnapshotFields = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: Pick<FlatObjectMetadata, 'fieldIds'>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): ResolvedFieldValueSnapshotField[] => {
  const objectFields = flatObjectMetadata.fieldIds
    .map((fieldId) =>
      findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: fieldId,
        flatEntityMaps: flatFieldMetadataMaps,
      }),
    )
    .filter(isDefined);

  return FIELD_VALUE_SNAPSHOT_FIELDS.flatMap(
    ({
      snapshotFieldUniversalIdentifier,
      subjectObjectMetadataIdFieldUniversalIdentifier,
      subjectMorphId,
    }) => {
      const snapshotField = objectFields.find(
        (field) =>
          field.universalIdentifier === snapshotFieldUniversalIdentifier,
      );
      const subjectObjectMetadataIdField = objectFields.find(
        (field) =>
          field.universalIdentifier ===
          subjectObjectMetadataIdFieldUniversalIdentifier,
      );

      if (
        !isDefined(snapshotField) ||
        !isDefined(subjectObjectMetadataIdField)
      ) {
        return [];
      }

      const subjectJoinColumns = objectFields.flatMap((field) =>
        field.morphId === subjectMorphId &&
        isDefined(field.relationTargetObjectMetadataId)
          ? [
              {
                joinColumnName: getJoinColumnNameForRelationField(field),
                objectMetadataId: field.relationTargetObjectMetadataId,
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
};
