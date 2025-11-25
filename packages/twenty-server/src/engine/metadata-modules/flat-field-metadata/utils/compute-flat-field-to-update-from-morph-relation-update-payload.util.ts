import {
  FieldMetadataType,
  type RelationUpdatePayload,
} from 'twenty-shared/types';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { generateMorphOrRelationFlatFieldMetadataPair } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-morph-or-relation-flat-field-metadata-pair.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getMorphNameFromMorphFieldMetadataName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-morph-name-from-morph-field-metadata-name.util';

type ComputeFlatFieldToUpdateFromMorphRelationUpdatePayloadArgs = {
  workspaceCustomApplicationId: string;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  morphRelationsUpdatePayload?: RelationUpdatePayload[];
  fieldMetadataToUpdate: FlatFieldMetadata;
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

  if (
    !isFlatFieldMetadataOfType(
      fieldMetadataToUpdate,
      FieldMetadataType.MORPH_RELATION,
    )
  ) {
    throw new FieldMetadataException(
      'Field metadata to update is not a morph or relation field metadata',
      FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
    );
  }

  const sourceObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: fieldMetadataToUpdate.objectMetadataId,
    flatEntityMaps: flatObjectMetadataMaps,
  });

  if (!isDefined(sourceObjectMetadata)) {
    throw new FieldMetadataException(
      'Target flat object metadata not found',
      FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
    );
  }

  const morphRelationsCommonLabel = fieldMetadataToUpdate.label;

  const initialFlatFieldMetadataTargetObjectMetadata =
    findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: fieldMetadataToUpdate.relationTargetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

  if (!isDefined(initialFlatFieldMetadataTargetObjectMetadata)) {
    throw new FieldMetadataException(
      'Initial flat field metadata target object metadata not found',
      FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
    );
  }

  const morphNameWithoutObjectName = getMorphNameFromMorphFieldMetadataName({
    morphRelationFlatFieldMetadata: {
      name: fieldMetadataToUpdate.name,
      settings: fieldMetadataToUpdate.settings,
    },
    nameSingular: initialFlatFieldMetadataTargetObjectMetadata.nameSingular,
    namePlural: initialFlatFieldMetadataTargetObjectMetadata.namePlural,
  });

  const initialTargetFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: fieldMetadataToUpdate.relationTargetFieldMetadataId,
    flatEntityMaps: flatFieldMetadataMaps,
  });
  const commonTargetFieldLabel = initialTargetFieldMetadata?.label ?? null;
  const commonTargetFieldName = initialTargetFieldMetadata?.name ?? null;
  const commonObjectMetadataId =
    initialTargetFieldMetadata?.objectMetadataId ?? null;

  if (
    !isDefined(commonTargetFieldLabel) ||
    !isDefined(commonTargetFieldName) ||
    !isDefined(commonObjectMetadataId)
  ) {
    throw new FieldMetadataException(
      'Initial target field metadata or object metadata not found',
      FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
    );
  }

  morphRelationsUpdatePayload.forEach((morphRelationUpdatePayload) => {
    const { targetObjectMetadataId } = morphRelationUpdatePayload;

    const newTargetObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: targetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(newTargetObjectMetadata)) {
      throw new FieldMetadataException(
        'New target object metadata not found',
        FieldMetadataExceptionCode.FIELD_METADATA_NOT_FOUND,
      );
    }

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
