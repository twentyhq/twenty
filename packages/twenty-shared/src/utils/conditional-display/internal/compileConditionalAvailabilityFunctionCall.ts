import { isString } from '@sniptt/guards';

import { CONDITIONAL_AVAILABILITY_FAVORITE_RECORD_IDS_VARIABLE_NAME } from '@/constants/internal/ConditionalAvailabilityFavoriteRecordIdsVariableName';
import { type ConditionalDisplaySelectedRecordsMatch } from '@/types/conditional-display/ConditionalDisplaySelectedRecordsMatch';
import { type ConditionalAvailabilityCompiledItem } from '@/types/conditional-display/internal/ConditionalAvailabilityCompiledItem';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { ViewFilterOperand } from '@/types/ViewFilterOperand';
import { buildConditionalAvailabilityCompilationError } from '@/utils/conditional-display/internal/buildConditionalAvailabilityCompilationError';
import { buildConditionalDisplayContextConditionNode } from '@/utils/conditional-display/internal/buildConditionalDisplayContextConditionNode';
import { compileConditionalAvailabilitySelectedRecordsCall } from '@/utils/conditional-display/internal/compileConditionalAvailabilitySelectedRecordsCall';
import { describeConditionalAvailabilityCompiledItem } from '@/utils/conditional-display/internal/describeConditionalAvailabilityCompiledItem';
import { resolveConditionalAvailabilitySubject } from '@/utils/conditional-display/internal/resolveConditionalAvailabilitySubject';
import { getFilterOperandsForFilterableFieldType } from '@/utils/filter/utils/getFilterOperandsForFilterableFieldType';
import { getFilterTypeFromFieldType } from '@/utils/filter/utils/getFilterTypeFromFieldType';
import { isDefined } from '@/utils/validation/isDefined';

export const compileConditionalAvailabilityFunctionCall = ({
  functionName,
  functionArguments,
  expression,
}: {
  functionName: string;
  functionArguments: ConditionalAvailabilityCompiledItem[];
  expression: string;
}): ConditionalAvailabilityCompiledItem => {
  const [first, second] = functionArguments;
  const singleSubject =
    functionArguments.length === 1
      ? resolveConditionalAvailabilitySubject(first)
      : undefined;
  const unsupportedCall = `unsupported call of ${functionName}(${functionArguments.map(describeConditionalAvailabilityCompiledItem).join(', ')})`;

  const fail = (reason: string): never => {
    throw buildConditionalAvailabilityCompilationError({ expression, reason });
  };

  const compileSelectedRecordsCall = (
    selectedRecordsMatch: ConditionalDisplaySelectedRecordsMatch,
    operand: ViewFilterOperand,
  ) =>
    compileConditionalAvailabilitySelectedRecordsCall({
      functionName,
      selectedRecordsMatch,
      operand,
      functionArguments,
      expression,
    }) ?? fail(unsupportedCall);

  switch (functionName) {
    case 'arrayLength':
      return functionArguments.length === 1 &&
        first?.kind === 'reference' &&
        first.name ===
          CONDITIONAL_AVAILABILITY_FAVORITE_RECORD_IDS_VARIABLE_NAME
        ? { kind: 'favoriteRecordCount' }
        : fail(unsupportedCall);
    case 'isNonEmptyString':
      return singleSubject?.virtualField.type === FieldMetadataType.SELECT ||
        singleSubject?.virtualField.type === FieldMetadataType.TEXT
        ? buildConditionalDisplayContextConditionNode(
            singleSubject,
            ViewFilterOperand.IS_NOT_EMPTY,
          )
        : fail(
            `${unsupportedCall}: isNonEmptyString accepts a text context value (pageType, objectMetadataItem.nameSingular or objectMetadataLabel); use someNonEmptyString(selectedRecords, "path") for record fields`,
          );
    case 'includes': {
      const subject =
        functionArguments.length === 2
          ? resolveConditionalAvailabilitySubject(second)
          : undefined;
      const values =
        first?.kind === 'list' && first.values.every(isString)
          ? first.values.filter(isString)
          : [];
      const options = subject?.virtualField.options;

      return subject?.virtualField.type === FieldMetadataType.SELECT &&
        values.length > 0 &&
        (!isDefined(options) ||
          values.every((value) => options.includes(value)))
        ? buildConditionalDisplayContextConditionNode(
            subject,
            ViewFilterOperand.IS,
            JSON.stringify(values),
          )
        : fail(
            `${unsupportedCall}: includes accepts a list of values followed by pageType or objectMetadataItem.nameSingular, e.g. includes(["INDEX_PAGE", "RECORD_PAGE"], pageType); use someEquals or includesSome(selectedRecords, "path", value) for record fields`,
          );
    }
    case 'isDefined':
      return isDefined(singleSubject?.subFieldName) &&
        getFilterOperandsForFilterableFieldType({
          filterType: getFilterTypeFromFieldType(
            singleSubject.virtualField.type,
          ),
        }).includes(ViewFilterOperand.IS_NOT_EMPTY)
        ? buildConditionalDisplayContextConditionNode(
            singleSubject,
            ViewFilterOperand.IS_NOT_EMPTY,
          )
        : fail(unsupportedCall);
    case 'every':
    case 'everyDefined':
      return compileSelectedRecordsCall(
        'EVERY',
        ViewFilterOperand.IS_NOT_EMPTY,
      );
    case 'none':
    case 'noneDefined':
      return compileSelectedRecordsCall('EVERY', ViewFilterOperand.IS_EMPTY);
    case 'some':
    case 'someDefined':
    case 'someNonEmptyString':
      return compileSelectedRecordsCall('SOME', ViewFilterOperand.IS_NOT_EMPTY);
    case 'everyEquals':
      return compileSelectedRecordsCall('EVERY', ViewFilterOperand.IS);
    case 'noneEquals':
      return compileSelectedRecordsCall('EVERY', ViewFilterOperand.IS_NOT);
    case 'someEquals':
      return compileSelectedRecordsCall('SOME', ViewFilterOperand.IS);
    case 'includesEvery':
      return compileSelectedRecordsCall('EVERY', ViewFilterOperand.CONTAINS);
    case 'includesNone':
      return compileSelectedRecordsCall(
        'EVERY',
        ViewFilterOperand.DOES_NOT_CONTAIN,
      );
    case 'includesSome':
      return compileSelectedRecordsCall('SOME', ViewFilterOperand.CONTAINS);
    default:
      return fail(`unsupported function "${functionName}"`);
  }
};
