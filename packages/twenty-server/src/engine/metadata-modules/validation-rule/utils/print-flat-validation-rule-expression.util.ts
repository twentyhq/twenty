/* @license Enterprise */

import { printValidationRuleExpression } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatValidationRule } from 'src/engine/metadata-modules/flat-validation-rule/types/flat-validation-rule.type';
import { buildValidationRuleFieldDescriptors } from 'src/engine/metadata-modules/validation-rule/utils/build-validation-rule-field-descriptors.util';

// Clients read and write rules as text, so the stored tree is printed with the current field names
export const printFlatValidationRuleExpression = ({
  flatValidationRule: { tree, objectMetadataId },
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatValidationRule: Pick<FlatValidationRule, 'tree' | 'objectMetadataId'>;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): string =>
  printValidationRuleExpression({
    tree,
    fields: buildValidationRuleFieldDescriptors({
      objectMetadataId,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      shouldIncludeInactiveFields: true,
    }),
  }) ?? '';
