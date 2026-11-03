import { msg, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type UniversalConditionalDisplayRecordFilter } from 'src/engine/metadata-modules/flat-conditional-display/types/universal-conditional-display-record-filter.type';
import { type ValidateConditionalDisplayContext } from 'src/engine/metadata-modules/flat-conditional-display/types/validate-conditional-display-context.type';
import { getConditionalDisplayPropertyOwner } from 'src/engine/metadata-modules/flat-conditional-display/utils/get-conditional-display-property-owner.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { validateRecordFilterFieldLeaf } from 'src/engine/metadata-modules/flat-field-metadata/utils/validate-record-filter-field-leaf.util';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateConditionalDisplayFieldRecordFilter = ({
  recordFilter,
  fieldMetadataUniversalIdentifier,
  objectMetadataUniversalIdentifier,
  property,
  surface,
  invalidDataCode,
  flatFieldMetadataMaps,
}: {
  recordFilter: UniversalConditionalDisplayRecordFilter;
  fieldMetadataUniversalIdentifier: string;
} & Pick<
  ValidateConditionalDisplayContext,
  | 'objectMetadataUniversalIdentifier'
  | 'property'
  | 'surface'
  | 'invalidDataCode'
  | 'flatFieldMetadataMaps'
>): FlatEntityValidationError[] => {
  if (getConditionalDisplayPropertyOwner(property) === 'engine') {
    return [
      {
        code: invalidDataCode,
        message: t`Conditional display rules in ${property} cannot reference a record field`,
        userFriendlyMessage: msg`Conditional display rule cannot use a record field in this condition`,
        value: fieldMetadataUniversalIdentifier,
      },
    ];
  }

  if (!isDefined(objectMetadataUniversalIdentifier)) {
    return [
      {
        code: invalidDataCode,
        message: t`Conditional display rules on ${surface} cannot reference a record field`,
        userFriendlyMessage: msg`Conditional display rule cannot use a record field here`,
        value: fieldMetadataUniversalIdentifier,
      },
    ];
  }

  const filterField = findFlatEntityByUniversalIdentifier({
    flatEntityMaps: flatFieldMetadataMaps,
    universalIdentifier: fieldMetadataUniversalIdentifier,
  });

  if (
    !isDefined(filterField) ||
    filterField.objectMetadataUniversalIdentifier !==
      objectMetadataUniversalIdentifier
  ) {
    return [
      {
        code: invalidDataCode,
        message: t`Field "${fieldMetadataUniversalIdentifier}" of a conditional display rule does not belong to object "${objectMetadataUniversalIdentifier}"`,
        userFriendlyMessage: msg`Conditional display rule references a field that does not belong to this object`,
        value: fieldMetadataUniversalIdentifier,
      },
    ];
  }

  const { relationTargetFieldMetadataUniversalIdentifier } = recordFilter;

  const relationTargetField = isDefined(
    relationTargetFieldMetadataUniversalIdentifier,
  )
    ? findFlatEntityByUniversalIdentifier({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: relationTargetFieldMetadataUniversalIdentifier,
      })
    : undefined;

  if (
    isDefined(relationTargetFieldMetadataUniversalIdentifier) &&
    !isDefined(relationTargetField)
  ) {
    return [
      {
        code: invalidDataCode,
        message: t`Relation target field "${relationTargetFieldMetadataUniversalIdentifier}" of a conditional display rule does not exist`,
        userFriendlyMessage: msg`Conditional display rule references a field that does not exist`,
        value: relationTargetFieldMetadataUniversalIdentifier,
      },
    ];
  }

  return validateRecordFilterFieldLeaf<FlatEntityValidationError>({
    recordFilter,
    filterField,
    relationTargetField,
    buildUnsupportedOperandError: ({
      rawOperand,
      effectiveFieldType,
      allowedOperandsText,
    }) => ({
      code: invalidDataCode,
      message: t`Operand "${rawOperand}" of a conditional display rule is not supported on field type "${effectiveFieldType}". Supported operands: ${allowedOperandsText}.`,
      userFriendlyMessage: msg`Conditional display rule operand is not supported for this field type`,
      value: rawOperand,
    }),
    buildInvalidValueError: ({
      stringifiedValue,
      operand,
      filterType,
      hint,
    }) => ({
      code: invalidDataCode,
      message: isNonEmptyString(hint)
        ? t`Value "${stringifiedValue}" of a conditional display rule is not valid for operand "${operand}" on field type "${filterType}". ${hint}`
        : t`Value "${stringifiedValue}" of a conditional display rule is not valid for operand "${operand}" on field type "${filterType}".`,
      userFriendlyMessage: msg`Conditional display rule value is not valid for this operand`,
      value: recordFilter.value,
    }),
  });
};
