import { VALIDATION_RULE_NOW_VARIABLE_NAME } from '@/constants/ValidationRuleNowVariableName';
import { VALIDATION_RULE_PREVIOUS_VARIABLE_NAME } from '@/constants/ValidationRulePreviousVariableName';
import { compositeTypeDefinitions } from '@/types/composite-types/composite-type-definitions';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { type ValidationRuleBindings } from '@/types/ValidationRuleBindings';
import { type ValidationRuleErrorCode } from '@/types/ValidationRuleErrorCode';
import { type ValidationRuleErrorParams } from '@/types/ValidationRuleErrorParams';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { isValidationRuleToOneRelationField } from '@/utils/validation-rule/isValidationRuleToOneRelationField';
import { isDefined } from '@/utils/validation/isDefined';

type ValidationRuleIdentifierPathError = {
  errorMessage: string;
  errorCode: ValidationRuleErrorCode;
  errorParams: ValidationRuleErrorParams;
};

type ResolveValidationRuleIdentifierPathResult =
  | { isResolved: true; bindings: ValidationRuleBindings }
  | ({ isResolved: false } & ValidationRuleIdentifierPathError);

const resolveSubfieldSegments = ({
  field,
  subfieldSegments,
  path,
}: {
  field: ValidationRuleFieldDescriptor;
  subfieldSegments: string[];
  path: string;
}): ValidationRuleIdentifierPathError | null => {
  if (subfieldSegments.length === 0) {
    return null;
  }

  const compositeType = compositeTypeDefinitions.get(field.type);

  if (!isDefined(compositeType) || subfieldSegments.length > 1) {
    return {
      errorMessage: `"${path}" goes deeper than the field "${field.name}" allows`,
      errorCode: 'SUBFIELD_TOO_DEEP',
      errorParams: { path, fieldName: field.name },
    };
  }

  const subfieldName = subfieldSegments[0];

  const isKnownSubfield = compositeType.properties.some(
    (property) => property.name === subfieldName,
  );

  return isKnownSubfield
    ? null
    : {
        errorMessage: `"${subfieldName}" is not a subfield of "${field.name}"`,
        errorCode: 'UNKNOWN_SUBFIELD',
        errorParams: { subfieldName, fieldName: field.name },
      };
};

const buildNotAValueError = (
  path: string,
): ValidationRuleIdentifierPathError => ({
  errorMessage: `"${path}" is not a value`,
  errorCode: 'NOT_A_VALUE',
  errorParams: { path },
});

const isRelationField = (field: ValidationRuleFieldDescriptor) =>
  field.type === FieldMetadataType.RELATION ||
  field.type === FieldMetadataType.MORPH_RELATION;

const resolveFieldPath = ({
  path,
  segments,
  fields,
  bindingPrefix,
}: {
  path: string;
  segments: string[];
  fields: ValidationRuleFieldDescriptor[];
  bindingPrefix: string;
}): ResolveValidationRuleIdentifierPathResult => {
  const [rootSegment, ...memberSegments] = segments;

  if (!isDefined(rootSegment)) {
    return { isResolved: false, ...buildNotAValueError(path) };
  }

  const rootField = fields.find((field) => field.name === rootSegment);

  if (!isDefined(rootField)) {
    return {
      isResolved: false,
      errorMessage: `Unknown field "${rootSegment}"`,
      errorCode: 'UNKNOWN_FIELD',
      errorParams: { fieldName: rootSegment },
    };
  }

  const rootBinding = {
    [`${bindingPrefix}${rootSegment}`]: rootField.universalIdentifier,
  };

  if (!isRelationField(rootField)) {
    const subfieldError = resolveSubfieldSegments({
      field: rootField,
      subfieldSegments: memberSegments,
      path,
    });

    return !isDefined(subfieldError)
      ? { isResolved: true, bindings: rootBinding }
      : { isResolved: false, ...subfieldError };
  }

  if (!isValidationRuleToOneRelationField(rootField)) {
    return {
      isResolved: false,
      errorMessage: `"${rootSegment}" is not a to-one relation`,
      errorCode: 'NOT_A_TO_ONE_RELATION',
      errorParams: { fieldName: rootSegment },
    };
  }

  const [targetFieldSegment, ...targetSubfieldSegments] = memberSegments;

  if (!isDefined(targetFieldSegment)) {
    return { isResolved: true, bindings: rootBinding };
  }

  const targetField = rootField.relationTargetFields?.find(
    (field) => field.name === targetFieldSegment,
  );

  if (!isDefined(targetField)) {
    return {
      isResolved: false,
      errorMessage: `Unknown field "${targetFieldSegment}" on "${rootSegment}"`,
      errorCode: 'UNKNOWN_RELATION_TARGET_FIELD',
      errorParams: {
        fieldName: targetFieldSegment,
        relationFieldName: rootSegment,
      },
    };
  }

  if (isRelationField(targetField)) {
    return {
      isResolved: false,
      errorMessage: `"${path}" goes more than one relation deep`,
      errorCode: 'RELATION_TOO_DEEP',
      errorParams: { path },
    };
  }

  const subfieldError = resolveSubfieldSegments({
    field: targetField,
    subfieldSegments: targetSubfieldSegments,
    path,
  });

  return !isDefined(subfieldError)
    ? {
        isResolved: true,
        bindings: {
          ...rootBinding,
          [`${bindingPrefix}${rootSegment}.${targetFieldSegment}`]:
            targetField.universalIdentifier,
        },
      }
    : { isResolved: false, ...subfieldError };
};

export const resolveValidationRuleIdentifierPath = ({
  path,
  fields,
}: {
  path: string;
  fields: ValidationRuleFieldDescriptor[];
}): ResolveValidationRuleIdentifierPathResult => {
  const [rootSegment, ...memberSegments] = path.split('.');

  if (rootSegment === VALIDATION_RULE_NOW_VARIABLE_NAME) {
    return memberSegments.length === 0
      ? { isResolved: true, bindings: {} }
      : { isResolved: false, ...buildNotAValueError(path) };
  }

  if (rootSegment === VALIDATION_RULE_PREVIOUS_VARIABLE_NAME) {
    return resolveFieldPath({
      path,
      segments: memberSegments,
      fields,
      bindingPrefix: `${VALIDATION_RULE_PREVIOUS_VARIABLE_NAME}.`,
    });
  }

  return resolveFieldPath({
    path,
    segments: path.split('.'),
    fields,
    bindingPrefix: '',
  });
};
