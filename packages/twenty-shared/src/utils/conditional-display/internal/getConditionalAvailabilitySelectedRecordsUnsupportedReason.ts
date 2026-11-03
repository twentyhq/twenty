import { type ConditionalDisplayConditionNode } from '@/types/conditional-display/ConditionalDisplayConditionNode';
import { type ConditionalDisplaySelectedRecordsMatch } from '@/types/conditional-display/ConditionalDisplaySelectedRecordsMatch';
import { RecordFilterGroupLogicalOperator } from '@/types/RecordFilterGroupLogicalOperator';
import { ViewFilterOperand } from '@/types/ViewFilterOperand';
import { isDefined } from '@/utils/validation/isDefined';

const collectSelectedRecordsMatches = (
  conditionNode: ConditionalDisplayConditionNode,
): ConditionalDisplaySelectedRecordsMatch[] =>
  conditionNode.kind === 'recordFilter'
    ? [conditionNode.selectedRecordsMatch].filter(isDefined)
    : conditionNode.children.flatMap(collectSelectedRecordsMatches);

const referencesSelectedRecords = (
  conditionNode: ConditionalDisplayConditionNode,
): boolean =>
  conditionNode.kind === 'recordFilter'
    ? conditionNode.recordFilter.contextKey === 'selectedRecords'
    : conditionNode.children.some(referencesSelectedRecords);

const hasGroupNotDistributingOverRecords = (
  conditionNode: ConditionalDisplayConditionNode,
  logicalOperator: RecordFilterGroupLogicalOperator,
): boolean =>
  conditionNode.kind === 'recordFilterGroup' &&
  ((conditionNode.logicalOperator === logicalOperator &&
    conditionNode.children.filter(referencesSelectedRecords).length > 1) ||
    conditionNode.children.some((child) =>
      hasGroupNotDistributingOverRecords(child, logicalOperator),
    ));

const isSingleRecordSelectionRequired = (
  conditionNode: ConditionalDisplayConditionNode,
) =>
  (conditionNode.kind === 'recordFilterGroup' &&
  conditionNode.logicalOperator === RecordFilterGroupLogicalOperator.AND
    ? conditionNode.children
    : [conditionNode]
  ).some(
    (conjunct) =>
      conjunct.kind === 'recordFilter' &&
      conjunct.recordFilter.contextKey === 'numberOfSelectedRecords' &&
      conjunct.recordFilter.operand === ViewFilterOperand.IS &&
      conjunct.recordFilter.value === '1',
  );

export const getConditionalAvailabilitySelectedRecordsUnsupportedReason = (
  conditionNode: ConditionalDisplayConditionNode,
): string | undefined => {
  const selectedRecordsMatches = new Set(
    collectSelectedRecordsMatches(conditionNode),
  );

  if (selectedRecordsMatches.size > 1) {
    return 'unsupported mix of every and some record functions';
  }

  const nonDistributingLogicalOperator = selectedRecordsMatches.has('SOME')
    ? RecordFilterGroupLogicalOperator.AND
    : RecordFilterGroupLogicalOperator.OR;

  return !isSingleRecordSelectionRequired(conditionNode) &&
    hasGroupNotDistributingOverRecords(
      conditionNode,
      nonDistributingLogicalOperator,
    )
    ? `unsupported "${nonDistributingLogicalOperator.toLowerCase()}" between record functions over several selected records; guard the formula with \`numberOfSelectedRecords == 1\` at the top level, or express it as a single every/some over one path`
    : undefined;
};
