import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { FieldMetadataExceptionCode } from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FieldInputTranspilationResult } from 'src/engine/metadata-modules/flat-field-metadata/types/field-input-transpilation-result.type';
import {
  generateMorphOrRelationFlatFieldMetadataPair,
  type SourceTargetMorphOrRelationFlatFieldAndFlatIndex,
} from 'src/engine/metadata-modules/flat-field-metadata/utils/generate-morph-or-relation-flat-field-metadata-pair.util';
import { validateRelationCreationPayload } from 'src/engine/metadata-modules/flat-field-metadata/validators/utils/validate-relation-creation-payload.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

type FromRelationCreateFieldInputToFlatFieldMetadataArgs = {
  createFieldInput: Omit<CreateFieldInput, 'workspaceId'> & {
    type: FieldMetadataType.RELATION;
  };
  existingFlatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  sourceFlatObjectMetadata: FlatObjectMetadata;
  workspaceId: string;
  workspaceCustomApplicationId: string;
};
export const fromRelationCreateFieldInputToFlatFieldMetadatas = async ({
  existingFlatObjectMetadataMaps,
  sourceFlatObjectMetadata,
  createFieldInput,
  workspaceId,
  workspaceCustomApplicationId,
}: FromRelationCreateFieldInputToFlatFieldMetadataArgs): Promise<
  FieldInputTranspilationResult<SourceTargetMorphOrRelationFlatFieldAndFlatIndex>
> => {
  const rawCreationPayload = createFieldInput.relationCreationPayload;

  if (!isDefined(rawCreationPayload)) {
    return {
      status: 'fail',
      errors: [
        {
          code: FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
          message: `Relation creation payload is required`,
          userFriendlyMessage: msg`Relation creation payload is required`,
          value: rawCreationPayload,
        },
      ],
    };
  }

  const relationValidationResult = await validateRelationCreationPayload({
    existingFlatObjectMetadataMaps,
    relationCreationPayload: rawCreationPayload,
  });

  if (relationValidationResult.status === 'fail') {
    return relationValidationResult;
  }
  const { relationCreationPayload, targetFlatObjectMetadata } =
    relationValidationResult.result;

  const generateResult = generateMorphOrRelationFlatFieldMetadataPair({
    createFieldInput: {
      ...createFieldInput,
      relationCreationPayload,
    },
    sourceFlatObjectMetadataJoinColumnName:
      computeMorphOrRelationFieldJoinColumnName({
        name: createFieldInput.name,
      }),
    sourceFlatObjectMetadata,
    targetFlatObjectMetadata,
    targetFlatFieldMetadataType: FieldMetadataType.RELATION,
    workspaceId,
    workspaceCustomApplicationId,
  });

  return {
    status: 'success',
    result: generateResult,
  };
};
