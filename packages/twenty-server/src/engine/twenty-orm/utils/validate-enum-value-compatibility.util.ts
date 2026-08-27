import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

type ValidateEnumValueCompatibilityArgs = {
  workspaceMemberFieldMetadata: OrmFlatFieldMetadata;
  targetFieldMetadata: OrmFlatFieldMetadata;
  predicateValue: unknown;
};

export const validateEnumValueCompatibility = ({
  workspaceMemberFieldMetadata,
  targetFieldMetadata,
  predicateValue,
}: ValidateEnumValueCompatibilityArgs): boolean => {
  const isWorkspaceMemberFieldEnum =
    workspaceMemberFieldMetadata.type === FieldMetadataType.SELECT ||
    workspaceMemberFieldMetadata.type === FieldMetadataType.MULTI_SELECT;

  const isTargetFieldEnum =
    targetFieldMetadata.type === FieldMetadataType.SELECT ||
    targetFieldMetadata.type === FieldMetadataType.MULTI_SELECT;

  if (!isWorkspaceMemberFieldEnum || !isTargetFieldEnum) {
    return true;
  }

  const targetFieldOptions = targetFieldMetadata.options || [];
  const validTargetValues = new Set(
    targetFieldOptions.map((option) => option.value),
  );

  if (validTargetValues.size === 0) {
    return true;
  }

  const valuesToCheck = Array.isArray(predicateValue)
    ? predicateValue
    : [predicateValue];

  const allValuesAreValid = valuesToCheck.every(
    (value) => isDefined(value) && validTargetValues.has(String(value)),
  );

  return allValuesAreValid;
};
