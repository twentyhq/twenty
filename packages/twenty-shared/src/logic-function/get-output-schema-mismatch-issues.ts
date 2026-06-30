import { isDefined } from '@/utils';
import { type BaseOutputSchemaV2 } from '@/workflow/workflow-schema/types/base-output-schema.type';

const buildPath = (parentPath: string, key: string): string =>
  parentPath ? `${parentPath}.${key}` : key;

export const getOutputSchemaMismatchIssues = (
  declaredSchema: BaseOutputSchemaV2,
  expectedSchema: BaseOutputSchemaV2,
  parentPath = '',
): string[] => {
  const issues: string[] = [];

  for (const [key, expectedField] of Object.entries(expectedSchema)) {
    const path = buildPath(parentPath, key);
    const declaredField = declaredSchema[key];

    if (!isDefined(declaredField)) {
      issues.push(`Missing key "${path}" in declared output schema.`);
      continue;
    }

    if (expectedField.isLeaf !== declaredField.isLeaf) {
      issues.push(
        `Type mismatch at "${path}": expected ${
          expectedField.isLeaf ? expectedField.type : 'object'
        } but declared ${declaredField.isLeaf ? declaredField.type : 'object'}.`,
      );
      continue;
    }

    if (!expectedField.isLeaf && !declaredField.isLeaf) {
      issues.push(
        ...getOutputSchemaMismatchIssues(
          declaredField.value,
          expectedField.value,
          path,
        ),
      );
      continue;
    }

    if (
      expectedField.isLeaf &&
      declaredField.isLeaf &&
      expectedField.type !== 'unknown' &&
      declaredField.type !== 'unknown' &&
      expectedField.type !== declaredField.type
    ) {
      issues.push(
        `Type mismatch at "${path}": expected ${expectedField.type} but declared ${declaredField.type}.`,
      );
    }
  }

  return issues;
};
