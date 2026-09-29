import { type ValidationRuleBindings } from 'twenty-shared/types';
import { compileValidationRuleExpression } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildValidationRuleFieldDescriptors } from 'src/engine/metadata-modules/validation-rule/utils/build-validation-rule-field-descriptors.util';
import {
  ValidationRuleException,
  ValidationRuleExceptionCode,
} from 'src/engine/metadata-modules/validation-rule/validation-rule.exception';

export const compileValidationRuleExpressionOrThrow = ({
  expression,
  objectMetadataId,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  expression: string;
  objectMetadataId: string;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): ValidationRuleBindings => {
  const compilationResult = compileValidationRuleExpression({
    expression,
    fields: buildValidationRuleFieldDescriptors({
      objectMetadataId,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    }),
  });

  if (!compilationResult.isValid) {
    throw new ValidationRuleException(
      compilationResult.errorMessage,
      ValidationRuleExceptionCode.INVALID_VALIDATION_RULE_EXPRESSION,
    );
  }

  return compilationResult.bindings;
};
