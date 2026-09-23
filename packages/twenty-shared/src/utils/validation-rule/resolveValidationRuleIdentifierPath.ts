import { VALIDATION_RULE_NOW_VARIABLE_NAME } from '@/constants/ValidationRuleNowVariableName';
import { compositeTypeDefinitions } from '@/types/composite-types/composite-type-definitions';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
import { type ValidationRuleBindings } from '@/types/ValidationRuleBindings';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';

type ResolveValidationRuleIdentifierPathResult =
  | { isResolved: true; bindings: ValidationRuleBindings }
  | { isResolved: false; errorMessage: string };

const resolveSubfieldSegments = ({
  field,
  subfieldSegments,
  path,
}: {
  field: ValidationRuleFieldDescriptor;
  subfieldSegments: string[];
  path: string;
}): string | null => {
  if (subfieldSegments.length === 0) {
    return null;
  }

  const compositeType = compositeTypeDefinitions.get(field.type);

  if (compositeType === undefined || subfieldSegments.length > 1) {
    return `"${path}" goes deeper than the field "${field.name}" allows`;
  }

  const isKnownSubfield = compositeType.properties.some(
    (property) => property.name === subfieldSegments[0],
  );

  return isKnownSubfield
    ? null
    : `"${subfieldSegments[0]}" is not a subfield of "${field.name}"`;
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
      : { isResolved: false, errorMessage: `"${path}" is not a value` };
  }

  const rootField = fields.find((field) => field.name === rootSegment);

  if (rootField === undefined) {
    return { isResolved: false, errorMessage: `Unknown field "${rootSegment}"` };
  }

  const isRelationField =
    rootField.type === FieldMetadataType.RELATION ||
    rootField.type === FieldMetadataType.MORPH_RELATION;

  if (!isRelationField) {
    const subfieldError = resolveSubfieldSegments({
      field: rootField,
      subfieldSegments: memberSegments,
      path,
    });

    return subfieldError === null
      ? {
          isResolved: true,
          bindings: { [rootSegment]: rootField.universalIdentifier },
        }
      : { isResolved: false, errorMessage: subfieldError };
  }

  if (
    rootField.type === FieldMetadataType.MORPH_RELATION ||
    rootField.relationType !== RelationType.MANY_TO_ONE ||
    rootField.relationTargetFields === undefined
  ) {
    return {
      isResolved: false,
      errorMessage: `"${rootSegment}" is not a to-one relation`,
    };
  }

  const [targetFieldSegment, ...targetSubfieldSegments] = memberSegments;

  if (targetFieldSegment === undefined) {
    return {
      isResolved: true,
      bindings: { [rootSegment]: rootField.universalIdentifier },
    };
  }

  const targetField = rootField.relationTargetFields.find(
    (field) => field.name === targetFieldSegment,
  );

  if (targetField === undefined) {
    return {
      isResolved: false,
      errorMessage: `Unknown field "${targetFieldSegment}" on "${rootSegment}"`,
    };
  }

  if (
    targetField.type === FieldMetadataType.RELATION ||
    targetField.type === FieldMetadataType.MORPH_RELATION
  ) {
    return {
      isResolved: false,
      errorMessage: `"${path}" goes more than one relation deep`,
    };
  }

  const subfieldError = resolveSubfieldSegments({
    field: targetField,
    subfieldSegments: targetSubfieldSegments,
    path,
  });

  return subfieldError === null
    ? {
        isResolved: true,
        bindings: {
          [rootSegment]: rootField.universalIdentifier,
          [`${rootSegment}.${targetFieldSegment}`]:
            targetField.universalIdentifier,
        },
      }
    : { isResolved: false, errorMessage: subfieldError };
};
