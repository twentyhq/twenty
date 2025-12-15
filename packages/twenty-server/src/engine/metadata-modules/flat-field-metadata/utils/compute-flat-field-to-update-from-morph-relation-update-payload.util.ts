import {
  FieldMetadataType,
  type RelationUpdatePayload,
} from 'twenty-shared/types';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';

import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { generateMorphOrRelationFlatFieldMetadataPair } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-morph-or-relation-flat-field-metadata-pair.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';

type ComputeFlatFieldToUpdateFromMorphRelationUpdatePayloadArgs = {
  workspaceCustomApplicationId: string;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  morphRelationsUpdatePayload?: RelationUpdatePayload[];
  fieldMetadataToUpdate: FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
};

export const computeFlatFieldToUpdateFromMorphRelationUpdatePayload = ({
  workspaceCustomApplicationId,
  flatFieldMetadataMaps,
  morphRelationsUpdatePayload,
  fieldMetadataToUpdate,
  flatObjectMetadataMaps,
}: ComputeFlatFieldToUpdateFromMorphRelationUpdatePayloadArgs): {
  flatFieldMetadatasToCreate: FlatFieldMetadata[];
  flatIndexMetadatasToCreate: FlatIndexMetadata[];
} => {
  const flatFieldMetadatasToCreate: FlatFieldMetadata[] = [];
  const flatIndexMetadatasToCreate: FlatIndexMetadata[] = [];

  if (!isDefined(morphRelationsUpdatePayload)) {
    return { flatFieldMetadatasToCreate, flatIndexMetadatasToCreate };
  }

  const sourceObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityId: fieldMetadataToUpdate.objectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  const morphRelationsCommonLabel = fieldMetadataToUpdate.label;

  const initialFlatFieldMetadataTargetObjectMetadata =
    findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: fieldMetadataToUpdate.relationTargetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

  const morphNameWithoutObjectName = getMorphNameFromMorphFieldMetadataName({
    morphRelationFlatFieldMetadata: {
      name: fieldMetadataToUpdate.name,
      settings: fieldMetadataToUpdate.settings,
    },
    nameSingular: initialFlatFieldMetadataTargetObjectMetadata.nameSingular,
    namePlural: initialFlatFieldMetadataTargetObjectMetadata.namePlural,
  });

  const initialTargetFieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityId: fieldMetadataToUpdate.relationTargetFieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });
  const commonTargetFieldLabel = initialTargetFieldMetadata.label;
  const commonTargetFieldName = initialTargetFieldMetadata.name;
  const commonObjectMetadataId = initialTargetFieldMetadata.objectMetadataId;

  morphRelationsUpdatePayload.forEach((morphRelationUpdatePayload) => {
    const { targetObjectMetadataId } = morphRelationUpdatePayload;

    const newTargetObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: targetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    const computedMorphName = computeMorphRelationFieldName({
      fieldName: morphNameWithoutObjectName,
      relationType: fieldMetadataToUpdate.settings.relationType,
      targetObjectMetadataNameSingular: newTargetObjectMetadata.nameSingular,
      targetObjectMetadataNamePlural: newTargetObjectMetadata.namePlural,
    });

    const { flatFieldMetadatas, indexMetadatas } =
      generateMorphOrRelationFlatFieldMetadataPair({
        createFieldInput: {
          type: FieldMetadataType.MORPH_RELATION,
          name: computedMorphName,
          label: morphRelationsCommonLabel,
          objectMetadataId: commonObjectMetadataId,
          relationCreationPayload: {
            type: fieldMetadataToUpdate.settings.relationType,
            targetObjectMetadataId,
            targetFieldLabel: commonTargetFieldLabel,
            targetFieldIcon: fieldMetadataToUpdate.icon ?? 'Icon123',
          },
        },
        sourceFlatObjectMetadata: sourceObjectMetadata,
        targetFlatObjectMetadata: newTargetObjectMetadata,
        targetFlatFieldMetadataType: FieldMetadataType.RELATION,
        workspaceId: fieldMetadataToUpdate.workspaceId,
        workspaceCustomApplicationId,
        sourceFlatObjectMetadataJoinColumnName:
          computeMorphOrRelationFieldJoinColumnName({
            name: computedMorphName,
          }),
        morphId: fieldMetadataToUpdate.morphId,
        targetFieldName: commonTargetFieldName,
      });

    flatFieldMetadatasToCreate.push(...flatFieldMetadatas);
    flatIndexMetadatasToCreate.push(...indexMetadatas);
  });

  return { flatFieldMetadatasToCreate, flatIndexMetadatasToCreate };
};
