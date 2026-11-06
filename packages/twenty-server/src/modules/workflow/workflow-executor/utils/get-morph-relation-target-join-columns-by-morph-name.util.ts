import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isMorphRelationHead } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';
import { type ObjectMetadataInfo } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';

export type MorphRelationTargetJoinColumn = {
  fieldName: string;
  joinColumnName: string;
  targetObjectMetadataId: string;
};

export const getMorphRelationTargetJoinColumnsByMorphName = ({
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: ObjectMetadataInfo): Map<string, MorphRelationTargetJoinColumn[]> => {
  const targetJoinColumnsByMorphName = new Map<
    string,
    MorphRelationTargetJoinColumn[]
  >();

  const objectFields = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  );

  for (const field of objectFields) {
    if (
      !isFlatFieldMetadataOfType(field, FieldMetadataType.MORPH_RELATION) ||
      field.settings.relationType !== RelationType.MANY_TO_ONE ||
      isMorphRelationHead(field)
    ) {
      continue;
    }

    const targetObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: field.relationTargetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    const morphName = getMorphNameFromMorphFieldMetadataName({
      morphRelationFlatFieldMetadata: field,
      nameSingular: targetObjectMetadata.nameSingular,
      namePlural: targetObjectMetadata.namePlural,
    });

    targetJoinColumnsByMorphName.set(morphName, [
      ...(targetJoinColumnsByMorphName.get(morphName) ?? []),
      {
        fieldName: field.name,
        joinColumnName: computeMorphOrRelationFieldJoinColumnName({
          name: field.name,
        }),
        targetObjectMetadataId: field.relationTargetObjectMetadataId,
      },
    ]);
  }

  return targetJoinColumnsByMorphName;
};
