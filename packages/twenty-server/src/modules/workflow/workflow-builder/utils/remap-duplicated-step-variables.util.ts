import { isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import {
  CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
  extractRawVariableNamePart,
} from 'twenty-shared/workflow';

const remapVariableTags = (
  text: string,
  clonedStepIdBySourceStepId: Map<string, string>,
): string => {
  return text.replace(
    CAPTURE_ALL_VARIABLE_TAG_INNER_REGEX,
    (variableTag, rawVariableName: string) => {
      const stepId = extractRawVariableNamePart({
        rawVariableName,
        part: 'stepId',
      });
      const clonedStepId = clonedStepIdBySourceStepId.get(stepId);

      if (!isDefined(clonedStepId)) {
        return variableTag;
      }

      return `{{${clonedStepId}${rawVariableName.slice(stepId.length)}}}`;
    },
  );
};

export const remapDuplicatedStepVariables = <TValue>(
  value: TValue,
  clonedStepIdBySourceStepId: Map<string, string>,
): TValue => {
  if (isString(value)) {
    return remapVariableTags(value, clonedStepIdBySourceStepId) as TValue;
  }

  if (Array.isArray(value)) {
    return value.map((item: unknown) =>
      remapDuplicatedStepVariables(item, clonedStepIdBySourceStepId),
    ) as TValue;
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        remapVariableTags(key, clonedStepIdBySourceStepId),
        remapDuplicatedStepVariables(item, clonedStepIdBySourceStepId),
      ]),
    ) as TValue;
  }

  return value;
};
