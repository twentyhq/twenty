import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isMorphRelationHead } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { getMorphRelationTargetJoinColumnsByMorphName } from 'src/modules/workflow/workflow-executor/utils/get-morph-relation-target-join-columns-by-morph-name.util';

// A step names a field the way its objectRecord does (company, companyId or a morph name);
// formatWorkflowRecordRelationFields decides which of these keys the record ends up holding
export const getWorkflowRecordKeysByFieldReference = (
  objectMetadataInfo: ObjectMetadataInfo,
): Map<string, string[]> => {
  const recordKeysByFieldReference = new Map<string, string[]>();

  const objectFields = getFlatFieldsFromFlatObjectMetadata(
    objectMetadataInfo.flatObjectMetadata,
    objectMetadataInfo.flatFieldMetadataMaps,
  );

  for (const field of objectFields) {
    if (isMorphRelationHead(field)) {
      continue;
    }

    const isManyToOneRelation =
      (isFlatFieldMetadataOfType(field, FieldMetadataType.RELATION) ||
        isFlatFieldMetadataOfType(field, FieldMetadataType.MORPH_RELATION)) &&
      field.settings.relationType === RelationType.MANY_TO_ONE;

    if (!isManyToOneRelation) {
      recordKeysByFieldReference.set(field.name, [field.name]);
      continue;
    }

    const joinColumnName = computeMorphOrRelationFieldJoinColumnName({
      name: field.name,
    });

    recordKeysByFieldReference.set(field.name, [field.name, joinColumnName]);
    recordKeysByFieldReference.set(joinColumnName, [
      field.name,
      joinColumnName,
    ]);
  }

  for (const [
    morphName,
    targetJoinColumns,
  ] of getMorphRelationTargetJoinColumnsByMorphName(objectMetadataInfo)) {
    recordKeysByFieldReference.set(
      morphName,
      targetJoinColumns.map(({ joinColumnName }) => joinColumnName),
    );
  }

  return recordKeysByFieldReference;
};
