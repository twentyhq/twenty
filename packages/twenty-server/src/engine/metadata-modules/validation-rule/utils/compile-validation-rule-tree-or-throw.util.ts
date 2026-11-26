/* @license Enterprise */

import { type ExpressionNode } from 'twenty-shared/expression';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildValidationRuleFieldDescriptors } from 'src/engine/metadata-modules/validation-rule/utils/build-validation-rule-field-descriptors.util';
import { compileValidationRuleTree } from 'src/engine/metadata-modules/validation-rule/utils/compile-validation-rule-tree.util';
import {
  ValidationRuleException,
  ValidationRuleExceptionCode,
} from 'src/engine/metadata-modules/validation-rule/validation-rule.exception';

// An inactive rule only has to parse: it is compiled when activated
export const compileValidationRuleTreeOrThrow = ({
  expression,
  isActive,
  objectMetadataId,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  expression: string;
  isActive: boolean;
  objectMetadataId: string;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): ExpressionNode => {
  const compilation = compileValidationRuleTree({
    expression,
    fields: buildValidationRuleFieldDescriptors({
      objectMetadataId,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    }),
    isParseOnly: !isActive,
  });

  if (!compilation.isValid) {
    throw new ValidationRuleException(
      compilation.errorMessage,
      ValidationRuleExceptionCode.INVALID_VALIDATION_RULE_EXPRESSION,
    );
  }

  return compilation.tree;
};
