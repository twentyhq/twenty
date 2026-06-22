import { isDefined } from '@/utils';
import { isObject } from 'class-validator';
import { FieldMetadataType } from '@/types/FieldMetadataType';

import { CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX } from '../../constants/CaptureAllVariableTagInnerRegex';
import { parseVariablePath } from '../../utils/variable-path.util';
import { type BaseOutputSchemaV2 } from '../types/base-output-schema.type';
import {
  type FieldOutputSchemaV2,
  type FindRecordsOutputSchema,
  type FormOutputSchema,
  type IteratorOutputSchema,
  type ManualTriggerOutputSchema,
  type RecordFieldLeaf,
  type RecordFieldNodeValue,
  type RecordOutputSchemaV2,
  type VariableSearchResult,
} from '../types/output-schema.type';

const EMPTY_RESULT: VariableSearchResult = {
  variableLabel: undefined,
  variablePathLabel: undefined,
};

const RECORD_STEP_TYPES = [
  'CREATE_RECORD',
  'UPDATE_RECORD',
  'DELETE_RECORD',
  'UPSERT_RECORD',
  'PICK_RECORD',
];

const isRecordOutputSchemaV2 = (
  schema: unknown,
): schema is RecordOutputSchemaV2 =>
  isObject(schema) &&
  '_outputSchemaType' in schema &&
  schema._outputSchemaType === 'RECORD';

const isBaseOutputSchemaV2Shape = (schema: unknown): boolean => {
  if (!isDefined(schema) || !isObject(schema) || Array.isArray(schema)) {
    return false;
  }

  return !(isObject(schema) && '_outputSchemaType' in schema);
};

const stripBrackets = (rawVariableName: string): string =>
  rawVariableName.replace(
    CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
    (_, variableName) => variableName,
  );

// Record output schema navigation

const getFieldFromSchema = (
  fieldKey: string,
  recordSchema: RecordFieldNodeValue,
): FieldOutputSchemaV2 | undefined =>
  isRecordOutputSchemaV2(recordSchema)
    ? recordSchema.fields[fieldKey]
    : (recordSchema as Record<string, RecordFieldLeaf>)[fieldKey];

const getCompositeSubFieldName = (
  recordSchema: RecordFieldNodeValue,
  fieldKey: string,
): string | undefined => {
  if (isRecordOutputSchemaV2(recordSchema)) {
    return undefined;
  }

  const field = (recordSchema as Record<string, RecordFieldLeaf>)[fieldKey];

  return field?.isCompositeSubField ? fieldKey : undefined;
};

const isIdFieldName = (fieldName: string): boolean =>
  fieldName === 'id' || fieldName.endsWith('.id');

const navigateToTargetField = (
  startingSchema: RecordOutputSchemaV2,
  pathSegments: string[],
): { schema: RecordFieldNodeValue; pathLabels: string[] } | null => {
  let currentSchema: RecordFieldNodeValue = startingSchema;
  const pathLabels: string[] = [];

  for (const pathSegment of pathSegments) {
    const field = getFieldFromSchema(pathSegment, currentSchema);

    if (!isDefined(field)) {
      return null;
    }

    if (isDefined(field.label)) {
      pathLabels.push(field.label);
    }

    const nextSchema = field.value;

    if (!isDefined(nextSchema)) {
      return null;
    }

    currentSchema = nextSchema as RecordFieldNodeValue;
  }

  return { schema: currentSchema, pathLabels };
};

const buildRecordVariableResult = (
  stepName: string,
  pathLabels: string[],
  targetSchema: RecordFieldNodeValue,
  targetFieldName: string,
  isFullRecord: boolean,
  stepNameLabel?: string,
): VariableSearchResult => {
  const targetField = getFieldFromSchema(targetFieldName, targetSchema);
  const variableLabel =
    isFullRecord &&
    isRecordOutputSchemaV2(targetSchema) &&
    isIdFieldName(targetFieldName)
      ? targetSchema.object.label
      : targetField?.label;

  if (!variableLabel) {
    return EMPTY_RESULT;
  }

  const fullPathSegments = [stepName, ...pathLabels, variableLabel];
  const basePath = fullPathSegments.join(' > ');
  const variablePathLabel = stepNameLabel
    ? `${basePath} (${stepNameLabel})`
    : basePath;

  return {
    variableLabel,
    variablePathLabel,
    variableType: targetField?.type,
    fieldMetadataId: targetField?.fieldMetadataId,
    compositeFieldSubFieldName: getCompositeSubFieldName(
      targetSchema,
      targetFieldName,
    ),
  };
};

export const searchRecordOutputSchema = ({
  stepName,
  recordOutputSchema,
  path,
  selectedField,
  isFullRecord,
  stepNameLabel,
}: {
  stepName: string;
  recordOutputSchema: RecordOutputSchemaV2;
  path: string[];
  selectedField: string;
  isFullRecord: boolean;
  stepNameLabel?: string;
}): VariableSearchResult => {
  const navigationResult = navigateToTargetField(recordOutputSchema, path);

  if (!navigationResult) {
    return EMPTY_RESULT;
  }

  return buildRecordVariableResult(
    stepName,
    navigationResult.pathLabels,
    navigationResult.schema,
    selectedField,
    isFullRecord,
    stepNameLabel,
  );
};

// Base output schema navigation

const navigateBaseToTargetField = (
  startingSchema: BaseOutputSchemaV2,
  pathSegments: string[],
): { schema: BaseOutputSchemaV2; pathLabels: string[] } | null => {
  let currentSchema: BaseOutputSchemaV2 = startingSchema;
  const pathLabels: string[] = [];

  for (const pathSegment of pathSegments) {
    const field = currentSchema[pathSegment];

    if (!isDefined(field) || field.isLeaf === true) {
      return null;
    }

    if (!isDefined(field.value)) {
      return null;
    }

    pathLabels.push(field.label);
    currentSchema = field.value;
  }

  return { schema: currentSchema, pathLabels };
};

const searchBaseOutputSchema = ({
  stepName,
  baseOutputSchema,
  path,
  selectedField,
}: {
  stepName: string;
  baseOutputSchema: BaseOutputSchemaV2;
  path: string[];
  selectedField: string;
}): VariableSearchResult => {
  const navigationResult = navigateBaseToTargetField(baseOutputSchema, path);

  if (!navigationResult) {
    return EMPTY_RESULT;
  }

  const targetField = navigationResult.schema[selectedField];

  if (!isDefined(targetField)) {
    return EMPTY_RESULT;
  }

  const fullPathSegments = [
    stepName,
    ...navigationResult.pathLabels,
    targetField.label,
  ];
  const variablePathLabel = fullPathSegments.join(' > ');

  return {
    variableLabel: targetField.label,
    variablePathLabel,
    variableType: targetField.type,
  };
};

// Per-schema-type search functions

const searchThroughRecordOutputSchema = ({
  stepName,
  recordOutputSchema,
  rawVariableName,
  isFullRecord,
}: {
  stepName: string;
  recordOutputSchema: RecordOutputSchemaV2;
  rawVariableName: string;
  isFullRecord: boolean;
}): VariableSearchResult => {
  if (!isDefined(recordOutputSchema)) {
    return EMPTY_RESULT;
  }

  const parts = parseVariablePath(stripBrackets(rawVariableName));
  const stepId = parts[0];
  const fieldName = parts[parts.length - 1];
  const pathSegments = parts.slice(1, -1);

  if (!isDefined(stepId) || !isDefined(fieldName)) {
    return EMPTY_RESULT;
  }

  return searchRecordOutputSchema({
    stepName,
    recordOutputSchema,
    selectedField: fieldName,
    path: pathSegments,
    isFullRecord,
  });
};

const searchThroughRecordEventOutputSchema = ({
  stepName,
  recordOutputSchema,
  rawVariableName,
  isFullRecord,
}: {
  stepName: string;
  recordOutputSchema: RecordOutputSchemaV2;
  rawVariableName: string;
  isFullRecord: boolean;
}): VariableSearchResult => {
  if (!isDefined(recordOutputSchema)) {
    return EMPTY_RESULT;
  }

  const parts = parseVariablePath(stripBrackets(rawVariableName));
  const stepId = parts[0];
  const firstFieldWithEventPrefix = parts.slice(1, 4).join('.');
  const remainingParts = parts.slice(4);
  const partsWithoutStepId = [firstFieldWithEventPrefix, ...remainingParts];
  const fieldName = partsWithoutStepId[partsWithoutStepId.length - 1];
  const pathSegments = partsWithoutStepId.slice(0, -1);

  if (!isDefined(stepId) || !isDefined(fieldName)) {
    return EMPTY_RESULT;
  }

  return searchRecordOutputSchema({
    stepName,
    recordOutputSchema,
    selectedField: fieldName,
    path: pathSegments,
    isFullRecord,
  });
};

const searchThroughBaseOutputSchema = ({
  stepName,
  baseOutputSchema,
  rawVariableName,
}: {
  stepName: string;
  baseOutputSchema: BaseOutputSchemaV2;
  rawVariableName: string;
}): VariableSearchResult => {
  if (!isDefined(baseOutputSchema)) {
    return EMPTY_RESULT;
  }

  const parts = parseVariablePath(stripBrackets(rawVariableName));
  const stepId = parts[0];
  const targetFieldName = parts[parts.length - 1];
  const pathSegments = parts.slice(1, -1);

  if (!isDefined(stepId) || !isDefined(targetFieldName)) {
    return EMPTY_RESULT;
  }

  return searchBaseOutputSchema({
    stepName,
    baseOutputSchema,
    path: pathSegments,
    selectedField: targetFieldName,
  });
};

const searchThroughFindRecordsOutputSchema = ({
  stepName,
  findRecordsOutputSchema,
  rawVariableName,
  isFullRecord,
  stepNameLabel,
}: {
  stepName: string;
  findRecordsOutputSchema: FindRecordsOutputSchema;
  rawVariableName: string;
  isFullRecord: boolean;
  stepNameLabel?: string;
}): VariableSearchResult => {
  if (!isDefined(findRecordsOutputSchema)) {
    return EMPTY_RESULT;
  }

  const parts = parseVariablePath(stripBrackets(rawVariableName));
  const stepId = parts[0];
  const searchResultKey = parts[1] as 'first' | 'all' | 'totalCount';
  const remainingParts = parts.slice(2);

  if (!isDefined(stepId) || !isDefined(searchResultKey)) {
    return EMPTY_RESULT;
  }

  if (searchResultKey === 'first') {
    const recordSchema = findRecordsOutputSchema.first?.value;
    const fieldName = remainingParts[remainingParts.length - 1];
    const pathSegments = remainingParts.slice(0, -1);

    if (!isDefined(recordSchema) || !isDefined(fieldName)) {
      return EMPTY_RESULT;
    }

    return searchRecordOutputSchema({
      stepName: `${stepName} > ${findRecordsOutputSchema.first?.label ?? 'First'}`,
      recordOutputSchema: recordSchema,
      selectedField: fieldName,
      path: pathSegments,
      isFullRecord,
      stepNameLabel,
    });
  }

  if (searchResultKey === 'totalCount') {
    const label = findRecordsOutputSchema.totalCount?.label ?? 'Total Count';
    const basePath = `${stepName} > ${label}`;

    return {
      variableLabel: label,
      variablePathLabel: stepNameLabel
        ? `${basePath} (${stepNameLabel})`
        : basePath,
      variableType: FieldMetadataType.NUMBER,
    };
  }

  if (searchResultKey === 'all') {
    const allField = findRecordsOutputSchema.all;
    const label = allField?.label ?? 'All Records';
    const basePath = `${stepName} > ${label}`;

    return {
      variableLabel: label,
      variablePathLabel: stepNameLabel
        ? `${basePath} (${stepNameLabel})`
        : basePath,
      variableType: FieldMetadataType.ARRAY,
    };
  }

  return EMPTY_RESULT;
};

const searchThroughFormOutputSchema = ({
  stepName,
  formOutputSchema,
  rawVariableName,
  isFullRecord,
}: {
  stepName: string;
  formOutputSchema: FormOutputSchema;
  rawVariableName: string;
  isFullRecord: boolean;
}): VariableSearchResult => {
  if (!isDefined(formOutputSchema)) {
    return EMPTY_RESULT;
  }

  const parts = parseVariablePath(stripBrackets(rawVariableName));
  const stepId = parts[0];
  const fieldName = parts[1];
  const remainingParts = parts.slice(2);
  const recordFieldName = remainingParts[remainingParts.length - 1];
  const pathSegments = remainingParts.slice(0, -1);

  if (!isDefined(stepId) || !isDefined(fieldName)) {
    return EMPTY_RESULT;
  }

  const formField = formOutputSchema[fieldName];

  if (!isDefined(formField)) {
    return EMPTY_RESULT;
  }

  if (formField.isLeaf) {
    return {
      variableLabel: formField.label,
      variablePathLabel: `${stepName} > ${formField.label}`,
      variableType: formField.type,
    };
  }

  if (!formField.isLeaf && isDefined(recordFieldName)) {
    return searchRecordOutputSchema({
      stepName: `${stepName} > ${formField.label}`,
      recordOutputSchema: formField.value,
      selectedField: recordFieldName,
      path: pathSegments,
      isFullRecord,
    });
  }

  return EMPTY_RESULT;
};

const searchThroughCodeOutputSchema = ({
  stepName,
  codeOutputSchema,
  rawVariableName,
}: {
  stepName: string;
  codeOutputSchema: unknown;
  rawVariableName: string;
}): VariableSearchResult => {
  if (!isDefined(codeOutputSchema)) {
    return EMPTY_RESULT;
  }

  if (
    isObject(codeOutputSchema) &&
    '_outputSchemaType' in codeOutputSchema &&
    codeOutputSchema._outputSchemaType === 'LINK'
  ) {
    return EMPTY_RESULT;
  }

  return searchThroughBaseOutputSchema({
    stepName,
    baseOutputSchema: codeOutputSchema as BaseOutputSchemaV2,
    rawVariableName,
  });
};

const searchThroughIteratorOutputSchema = ({
  stepName,
  iteratorOutputSchema,
  rawVariableName,
  isFullRecord,
}: {
  stepName: string;
  iteratorOutputSchema: IteratorOutputSchema;
  rawVariableName: string;
  isFullRecord: boolean;
}): VariableSearchResult => {
  if (!isDefined(iteratorOutputSchema)) {
    return EMPTY_RESULT;
  }

  const parts = parseVariablePath(stripBrackets(rawVariableName));
  const stepId = parts[0];
  const iteratorResultKey = parts[1] as
    | 'currentItem'
    | 'currentItemIndex'
    | 'hasProcessedAllItems';
  const remainingParts = parts.slice(2);

  if (!isDefined(stepId) || !isDefined(iteratorResultKey)) {
    return EMPTY_RESULT;
  }

  if (iteratorResultKey === 'currentItemIndex') {
    return {
      variableLabel: 'Current Item Index',
      variablePathLabel: `${stepName} > Current Item Index`,
      variableType: FieldMetadataType.NUMBER,
    };
  }

  if (iteratorResultKey === 'hasProcessedAllItems') {
    return {
      variableLabel: 'Has Processed All Items',
      variablePathLabel: `${stepName} > Has Processed All Items`,
      variableType: FieldMetadataType.BOOLEAN,
    };
  }

  if (iteratorResultKey === 'currentItem') {
    const schema = iteratorOutputSchema.currentItem.value;

    if (!isDefined(schema)) {
      return EMPTY_RESULT;
    }

    const fieldName = remainingParts[remainingParts.length - 1];
    const pathSegments = remainingParts.slice(0, -1);

    if (isRecordOutputSchemaV2(schema) && isDefined(fieldName)) {
      return searchRecordOutputSchema({
        stepName: `${stepName} > Current Item`,
        recordOutputSchema: schema,
        path: pathSegments,
        selectedField: fieldName,
        isFullRecord,
      });
    }

    if (isBaseOutputSchemaV2Shape(schema) && isDefined(fieldName)) {
      return searchBaseOutputSchema({
        stepName,
        baseOutputSchema: schema as BaseOutputSchemaV2,
        path: pathSegments,
        selectedField: fieldName,
      });
    }

    const currentItem = iteratorOutputSchema.currentItem;

    return {
      variableLabel: currentItem.label,
      variablePathLabel: `${stepName} > ${currentItem.label}`,
      variableType: currentItem.isLeaf ? currentItem.type : 'unknown',
    };
  }

  return EMPTY_RESULT;
};

const searchThroughManualTriggerOutputSchema = ({
  stepName,
  manualTriggerOutputSchema,
  rawVariableName,
  isFullRecord,
}: {
  stepName: string;
  manualTriggerOutputSchema: ManualTriggerOutputSchema;
  rawVariableName: string;
  isFullRecord: boolean;
}): VariableSearchResult => {
  if (!isDefined(manualTriggerOutputSchema)) {
    return EMPTY_RESULT;
  }

  const parts = parseVariablePath(stripBrackets(rawVariableName));
  const stepId = parts[0];
  const nodeKey = parts[1];
  const remainingParts = parts.slice(2);
  const fieldName = remainingParts[remainingParts.length - 1];
  const pathSegments = remainingParts.slice(0, -1);

  if (!isDefined(stepId) || !isDefined(nodeKey) || !isDefined(fieldName)) {
    return EMPTY_RESULT;
  }

  if (nodeKey === 'payload') {
    const { payload } = manualTriggerOutputSchema;

    if (!isDefined(payload)) {
      return EMPTY_RESULT;
    }

    const payloadStepName = `${stepName} > ${payload.label}`;

    // Single-record triggers nest a record schema, bulk triggers a plain map.
    if (isRecordOutputSchemaV2(payload.value)) {
      return searchRecordOutputSchema({
        stepName: payloadStepName,
        recordOutputSchema: payload.value,
        selectedField: fieldName,
        path: pathSegments,
        isFullRecord,
      });
    }

    return searchBaseOutputSchema({
      stepName: payloadStepName,
      baseOutputSchema: payload.value,
      path: pathSegments,
      selectedField: fieldName,
    });
  }

  if (nodeKey === 'metadata') {
    const { metadata } = manualTriggerOutputSchema;

    return searchBaseOutputSchema({
      stepName: `${stepName} > ${metadata.label}`,
      baseOutputSchema: metadata.value,
      path: pathSegments,
      selectedField: fieldName,
    });
  }

  return EMPTY_RESULT;
};

// Main dispatcher

export const searchVariableInOutputSchema = ({
  schema,
  stepType,
  stepName,
  rawVariableName,
  isFullRecord,
  stepNameLabel,
}: {
  schema: unknown;
  stepType: string;
  stepName: string;
  rawVariableName: string;
  isFullRecord: boolean;
  stepNameLabel?: string;
}): VariableSearchResult => {
  if (RECORD_STEP_TYPES.includes(stepType)) {
    return searchThroughRecordOutputSchema({
      stepName,
      recordOutputSchema: schema as RecordOutputSchemaV2,
      rawVariableName,
      isFullRecord,
    });
  }

  if (stepType === 'MANUAL') {
    return searchThroughManualTriggerOutputSchema({
      stepName,
      manualTriggerOutputSchema: schema as ManualTriggerOutputSchema,
      rawVariableName,
      isFullRecord,
    });
  }

  if (stepType === 'DATABASE_EVENT') {
    return searchThroughRecordEventOutputSchema({
      stepName,
      recordOutputSchema: schema as RecordOutputSchemaV2,
      rawVariableName,
      isFullRecord,
    });
  }

  if (stepType === 'FIND_RECORDS') {
    return searchThroughFindRecordsOutputSchema({
      stepName,
      findRecordsOutputSchema: schema as FindRecordsOutputSchema,
      rawVariableName,
      isFullRecord,
      stepNameLabel,
    });
  }

  if (stepType === 'FORM') {
    return searchThroughFormOutputSchema({
      stepName,
      formOutputSchema: schema as FormOutputSchema,
      rawVariableName,
      isFullRecord,
    });
  }

  if (stepType === 'CODE') {
    return searchThroughCodeOutputSchema({
      stepName,
      codeOutputSchema: schema,
      rawVariableName,
    });
  }

  if (stepType === 'ITERATOR') {
    return searchThroughIteratorOutputSchema({
      stepName,
      iteratorOutputSchema: schema as IteratorOutputSchema,
      rawVariableName,
      isFullRecord,
    });
  }

  return searchThroughBaseOutputSchema({
    stepName,
    baseOutputSchema: schema as BaseOutputSchemaV2,
    rawVariableName,
  });
};
