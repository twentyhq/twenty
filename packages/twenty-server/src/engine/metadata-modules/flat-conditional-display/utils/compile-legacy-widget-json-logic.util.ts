import {
  isArray,
  isBoolean,
  isNonEmptyArray,
  isNonEmptyString,
  isNumber,
  isString,
} from '@sniptt/guards';
import { CONDITIONAL_DISPLAY_DEVICES } from 'twenty-shared/constants';
import {
  type ConditionalDisplay,
  type ConditionalDisplayConditionNode,
  FieldMetadataType,
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  buildConditionalDisplayFromConditionNode,
  buildDeviceConditionalDisplay,
  buildDeviceConditionalDisplayConditionNode,
  fastDeepEqual,
  groupConditionalDisplayConditionNodes,
  isDefined,
  isPlainObject,
  negateConditionalDisplayConditionNode,
} from 'twenty-shared/utils';

import { LEGACY_WIDGET_JSON_LOGIC_SELECTED_RECORD_FIELD_VARIABLE_PATTERN } from 'src/engine/metadata-modules/flat-conditional-display/constants/legacy-widget-json-logic-selected-record-field-variable-pattern.constant';
import { type LegacyWidgetJsonLogicField } from 'src/engine/metadata-modules/flat-conditional-display/types/legacy-widget-json-logic-field.type';

const getSingleEntry = (node: unknown): [string, unknown] | undefined => {
  if (!isPlainObject(node)) {
    return undefined;
  }

  const entries = Object.entries(node);

  return entries.length === 1 ? entries[0] : undefined;
};

const getVariableName = (operand: unknown): string | undefined => {
  const [operator, variableName] = getSingleEntry(operand) ?? [];

  return operator === 'var' && isNonEmptyString(variableName)
    ? variableName
    : undefined;
};

const getEqualityOperand = (
  operator: string,
): ViewFilterOperand | undefined => {
  switch (operator) {
    case '==':
    case '===':
      return ViewFilterOperand.IS;
    case '!=':
    case '!==':
      return ViewFilterOperand.IS_NOT;
    default:
      return undefined;
  }
};

const getInclusionOperand = (
  fieldType: FieldMetadataType,
): ViewFilterOperand | undefined => {
  switch (fieldType) {
    case FieldMetadataType.MULTI_SELECT:
      return ViewFilterOperand.CONTAINS;
    case FieldMetadataType.SELECT:
      return ViewFilterOperand.IS;
    default:
      return undefined;
  }
};

const buildFieldConditionNode = ({
  field,
  operand,
  literal,
}: {
  field: LegacyWidgetJsonLogicField;
  operand: ViewFilterOperand | undefined;
  literal: unknown;
}): ConditionalDisplayConditionNode | undefined =>
  isDefined(operand) && isString(literal)
    ? {
        kind: 'recordFilter',
        recordFilter: {
          fieldMetadataId: field.fieldMetadataId,
          operand,
          value: JSON.stringify([literal]),
        },
      }
    : undefined;

export const compileLegacyWidgetJsonLogic = ({
  jsonLogic,
  resolveField,
}: {
  jsonLogic: unknown;
  resolveField: (fieldName: string) => LegacyWidgetJsonLogicField | undefined;
}): ConditionalDisplay => {
  const buildConversionError = (reason: string) =>
    new Error(
      `Cannot convert legacy widget json-logic ${JSON.stringify(jsonLogic)}: ${reason}`,
    );

  const resolveSelectedRecordField = (variableName: string | undefined) => {
    const fieldName = isDefined(variableName)
      ? LEGACY_WIDGET_JSON_LOGIC_SELECTED_RECORD_FIELD_VARIABLE_PATTERN.exec(
          variableName,
        )?.[1]
      : undefined;

    if (!isDefined(fieldName)) {
      return undefined;
    }

    const field = resolveField(fieldName);

    if (!isDefined(field)) {
      throw buildConversionError(`unknown field "${fieldName}"`);
    }

    return field;
  };

  const compileComparison = (
    operator: string,
    operands: unknown,
  ): ConditionalDisplayConditionNode | undefined => {
    if (!isArray(operands) || operands.length !== 2) {
      return undefined;
    }

    const [firstOperand, secondOperand] = operands;

    if (operator === 'in') {
      const field = resolveSelectedRecordField(getVariableName(secondOperand));

      return isDefined(field)
        ? buildFieldConditionNode({
            field,
            operand: getInclusionOperand(field.type),
            literal: firstOperand,
          })
        : undefined;
    }

    const operand = getEqualityOperand(operator);
    const variableName = getVariableName(firstOperand);

    if (
      !isDefined(operand) ||
      !isDefined(variableName) ||
      !(
        isString(secondOperand) ||
        isNumber(secondOperand) ||
        isBoolean(secondOperand)
      )
    ) {
      return undefined;
    }

    if (variableName === 'device') {
      const device = CONDITIONAL_DISPLAY_DEVICES.find(
        (conditionalDisplayDevice) =>
          conditionalDisplayDevice === secondOperand,
      );

      return isDefined(device)
        ? buildDeviceConditionalDisplayConditionNode({ device, operand })
        : undefined;
    }

    const field = resolveSelectedRecordField(variableName);

    return field?.type === FieldMetadataType.SELECT
      ? buildFieldConditionNode({ field, operand, literal: secondOperand })
      : undefined;
  };

  const compileOperation = (
    operator: string,
    operands: unknown,
  ): ConditionalDisplayConditionNode | undefined => {
    switch (operator) {
      case 'and':
      case 'or':
        return isNonEmptyArray(operands)
          ? groupConditionalDisplayConditionNodes({
              logicalOperator:
                operator === 'and'
                  ? RecordFilterGroupLogicalOperator.AND
                  : RecordFilterGroupLogicalOperator.OR,
              conditionNodes: operands.map((operand) => compileNode(operand)),
            })
          : undefined;
      case '!': {
        const negatedOperands = isArray(operands) ? operands : [operands];

        return negatedOperands.length === 1
          ? negateConditionalDisplayConditionNode(
              compileNode(negatedOperands[0]),
            )
          : undefined;
      }
      default:
        return compileComparison(operator, operands);
    }
  };

  const compileNode = (node: unknown): ConditionalDisplayConditionNode => {
    const [operator, operands] = getSingleEntry(node) ?? [];
    const conditionNode = isDefined(operator)
      ? compileOperation(operator, operands)
      : undefined;

    if (!isDefined(conditionNode)) {
      throw buildConversionError(`unsupported ${JSON.stringify(node)}`);
    }

    return conditionNode;
  };

  const conditionNode = compileNode(jsonLogic);

  const device = CONDITIONAL_DISPLAY_DEVICES.find((conditionalDisplayDevice) =>
    fastDeepEqual(
      conditionNode,
      buildDeviceConditionalDisplayConditionNode({
        device: conditionalDisplayDevice,
        operand: ViewFilterOperand.IS,
      }),
    ),
  );

  return isDefined(device)
    ? buildDeviceConditionalDisplay(device)
    : buildConditionalDisplayFromConditionNode({
        conditionNode,
        source: JSON.stringify(jsonLogic),
      });
};
