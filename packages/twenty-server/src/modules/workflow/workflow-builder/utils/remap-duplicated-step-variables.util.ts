import { isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

export const remapDuplicatedStepVariables = <TValue>(
  value: TValue,
  clonedStepIdBySourceStepId: Map<string, string>,
): TValue => {
  if (isString(value)) {
    return value.replace(
      /\{\{(\s*)([^{}.\s]+)(?=[.\s}])/g,
      (reference, whitespace: string, stepId: string) => {
        const clonedStepId = clonedStepIdBySourceStepId.get(stepId);

        return !isDefined(clonedStepId)
          ? reference
          : `{{${whitespace}${clonedStepId}`;
      },
    ) as TValue;
  }

  if (Array.isArray(value)) {
    return value.map((item: unknown) =>
      remapDuplicatedStepVariables(item, clonedStepIdBySourceStepId),
    ) as TValue;
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        remapDuplicatedStepVariables(key, clonedStepIdBySourceStepId),
        remapDuplicatedStepVariables(item, clonedStepIdBySourceStepId),
      ]),
    ) as TValue;
  }

  return value;
};
