import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isMorphRelationHead } from 'twenty-shared/utils';
import { buildWorkflowRecordKeysByFieldReference } from 'twenty-shared/workflow';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { getMorphRelationTargetJoinColumnsByMorphName } from 'src/modules/workflow/workflow-executor/utils/get-morph-relation-target-join-columns-by-morph-name.util';

export const getWorkflowRecordKeysByFieldReference = (
  objectMetadataInfo: ObjectMetadataInfo,
): Map<string, string[]> => {
  const morphNameByFieldName = new Map(
    [
      ...getMorphRelationTargetJoinColumnsByMorphName(objectMetadataInfo),
    ].flatMap(([morphName, targetJoinColumns]) =>
      targetJoinColumns.map(({ fieldName }) => [fieldName, morphName]),
    ),
  );

  const objectFields = getFlatFieldsFromFlatObjectMetadata(
    objectMetadataInfo.flatObjectMetadata,
    objectMetadataInfo.flatFieldMetadataMaps,
  ).filter((field) => !isMorphRelationHead(field));

  return buildWorkflowRecordKeysByFieldReference(
    objectFields.map((field) => {
      const isManyToOneRelation =
        (isFlatFieldMetadataOfType(field, FieldMetadataType.RELATION) ||
          isFlatFieldMetadataOfType(field, FieldMetadataType.MORPH_RELATION)) &&
        field.settings.relationType === RelationType.MANY_TO_ONE;

      return {
        name: field.name,
        manyToOneRelation: isManyToOneRelation
          ? {
              joinColumnName: computeMorphOrRelationFieldJoinColumnName({
                name: field.name,
              }),
              morphName: morphNameByFieldName.get(field.name),
            }
          : undefined,
      };
    }),
  );
};
