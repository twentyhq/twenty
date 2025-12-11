import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FieldInputTranspilationResult } from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { generateMorphOrRelationFlatFieldMetadataPair } from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-morph-or-relation-flat-field-metadata-pair.util';
import { validateMorphRelationCreationPayload } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-morph-relation-creation-payload.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type FromMorphRelationCreateFieldInputToFlatFieldMetadatasArgs = {
  createFieldInput: Omit<CreateFieldInput, 'workspaceId'> & {
    type: FieldMetadataType.MORPH_RELATION;
  };
  existingFlatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  sourceFlatObjectMetadata: FlatObjectMetadata;
  workspaceId: string;
  workspaceCustomApplicationId: string;
};
export const fromMorphRelationCreateFieldInputToFlatFieldMetadatas = async ({
  createFieldInput,
  existingFlatObjectMetadataMaps,
  sourceFlatObjectMetadata,
  workspaceId,
  workspaceCustomApplicationId,
}: FromMorphRelationCreateFieldInputToFlatFieldMetadatasArgs): Promise<
  FieldInputTranspilationResult<{
    flatFieldMetadatas: FlatFieldMetadata[];
    indexMetadatas: FlatIndexMetadata[];
  }>
> => {
  const rawMorphCreationPayload =
    createFieldInput.morphRelationsCreationPayload;

  if (
    !isDefined(rawMorphCreationPayload) ||
    !Array.isArray(rawMorphCreationPayload)
  ) {
    return {
      status: 'fail',
      errors: [
        {
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message: `Relation creation payload is required`,
          userFriendlyMessage: msg`Relation creation payload is required`,
          value: rawMorphCreationPayload,
        },
      ],
    };
  }

  const morphRelationCreationPayloadValidation =
    await validateMorphRelationCreationPayload({
      existingFlatObjectMetadataMaps,
      morphRelationCreationPayload: rawMorphCreationPayload,
      objectMetadataId: sourceFlatObjectMetadata.id,
    });

  if (morphRelationCreationPayloadValidation.status === 'fail') {
    return morphRelationCreationPayloadValidation;
  }

  const morphRelationCreationPayload =
    morphRelationCreationPayloadValidation.result;
  const morphId = v4();
  const flatFieldsAndIndexes = morphRelationCreationPayload.reduce(
    (acc, { relationCreationPayload, targetFlatObjectMetadata }) => {
      const currentMorphRelationFieldName = computeMorphRelationFieldName({
        fieldName: createFieldInput.name,
        relationType: relationCreationPayload.type,
        targetObjectMetadataNameSingular: targetFlatObjectMetadata.nameSingular,
        targetObjectMetadataNamePlural: targetFlatObjectMetadata.namePlural,
      });
      const sourceFlatObjectMetadataJoinColumnName =
        computeMorphOrRelationFieldJoinColumnName({
          name: currentMorphRelationFieldName,
        });

      const { flatFieldMetadatas, indexMetadatas } =
        generateMorphOrRelationFlatFieldMetadataPair({
          createFieldInput: {
            ...createFieldInput,
            relationCreationPayload,
            name: currentMorphRelationFieldName,
          },
          sourceFlatObjectMetadataJoinColumnName,
          sourceFlatObjectMetadata,
          targetFlatObjectMetadata,
          targetFlatFieldMetadataType: FieldMetadataType.RELATION,
          workspaceId,
          morphId,
          workspaceCustomApplicationId,
        });

      return {
        indexMetadatas: [...acc.indexMetadatas, ...indexMetadatas],
        flatFieldMetadatas: [...acc.flatFieldMetadatas, ...flatFieldMetadatas],
      };
    },
    {
      indexMetadatas: [],
      flatFieldMetadatas: [],
    },
  );

  return {
    status: 'success',
    result: flatFieldsAndIndexes,
  };
};
