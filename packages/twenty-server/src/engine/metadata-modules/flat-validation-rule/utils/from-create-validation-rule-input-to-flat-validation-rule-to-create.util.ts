import { type ValidationRuleBindings } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { resolveEntityRelationUniversalIdentifiers } from 'src/engine/metadata-modules/flat-entity/utils/resolve-entity-relation-universal-identifiers.util';
import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { type CreateValidationRuleInput } from 'src/engine/metadata-modules/validation-rule/dtos/create-validation-rule.input';

export const fromCreateValidationRuleInputToFlatValidationRuleToCreate = ({
  createValidationRuleInput,
  bindings,
  workspaceId,
  flatApplication,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  createValidationRuleInput: CreateValidationRuleInput;
  bindings: ValidationRuleBindings;
  workspaceId: string;
  flatApplication: FlatApplication;
} & Pick<
  AllFlatEntityMaps,
  'flatObjectMetadataMaps' | 'flatFieldMetadataMaps'
>): FlatValidationRule => {
  const id = v4();
  const now = new Date().toISOString();
  const errorFieldMetadataId =
    createValidationRuleInput.errorFieldMetadataId ?? null;

  const {
    objectMetadataUniversalIdentifier,
    errorFieldMetadataUniversalIdentifier,
  } = resolveEntityRelationUniversalIdentifiers({
    metadataName: 'validationRule',
    foreignKeyValues: {
      objectMetadataId: createValidationRuleInput.objectMetadataId,
      errorFieldMetadataId,
    },
    flatEntityMaps: { flatObjectMetadataMaps, flatFieldMetadataMaps },
  });

  return {
    id,
    universalIdentifier: id,
    workspaceId,
    applicationId: flatApplication.id,
    applicationUniversalIdentifier: flatApplication.universalIdentifier,
    objectMetadataId: createValidationRuleInput.objectMetadataId,
    objectMetadataUniversalIdentifier,
    errorFieldMetadataId,
    errorFieldMetadataUniversalIdentifier,
    expression: createValidationRuleInput.expression,
    bindings,
    message: createValidationRuleInput.message.trim(),
    isActive: createValidationRuleInput.isActive ?? true,
    evaluatorVersion: 1,
    createdAt: now,
    updatedAt: now,
  };
};
