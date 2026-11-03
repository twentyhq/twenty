import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';

type ValidatePredicateValueCompatibilityArgs = {
  workspaceMemberFieldMetadata: OrmFlatFieldMetadata;
  targetFieldMetadata: OrmFlatFieldMetadata;
  predicateValue: unknown;
};

const validateRelationTargetCompatibility = ({
  workspaceMemberFieldMetadata,
  targetFieldMetadata,
}: Omit<
  ValidatePredicateValueCompatibilityArgs,
  'predicateValue'
>): boolean => {
  if (workspaceMemberFieldMetadata.type !== FieldMetadataType.RELATION) {
    return true;
  }

  const workspaceMemberRelationTargetObjectMetadataId =
    workspaceMemberFieldMetadata.relationTargetObjectMetadataId;

  return (
    targetFieldMetadata.type === FieldMetadataType.RELATION &&
    isDefined(workspaceMemberRelationTargetObjectMetadataId) &&
    workspaceMemberRelationTargetObjectMetadataId ===
      targetFieldMetadata.relationTargetObjectMetadataId
  );
};

const validateEnumValueCompatibility = ({
  workspaceMemberFieldMetadata,
  targetFieldMetadata,
  predicateValue,
}: ValidatePredicateValueCompatibilityArgs): boolean => {
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

export const validatePredicateValueCompatibility = ({
  workspaceMemberFieldMetadata,
  targetFieldMetadata,
  predicateValue,
}: ValidatePredicateValueCompatibilityArgs): boolean =>
  validateRelationTargetCompatibility({
    workspaceMemberFieldMetadata,
    targetFieldMetadata,
  }) &&
  validateEnumValueCompatibility({
    workspaceMemberFieldMetadata,
    targetFieldMetadata,
    predicateValue,
  });
