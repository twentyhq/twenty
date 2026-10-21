import { isNonEmptyString } from '@sniptt/guards';

import { isDefined } from '@/utils/validation/isDefined';

export const parseFieldReferenceFilterValue = (
  value: unknown,
): { relationFieldName?: string; fieldName: string } | undefined => {
  if (!isNonEmptyString(value)) {
    return undefined;
  }

  const [firstSegment, secondSegment, ...otherSegments] = value.split('.');

  if (!isNonEmptyString(firstSegment) || otherSegments.length > 0) {
    return undefined;
  }

  if (!isDefined(secondSegment)) {
    return { fieldName: firstSegment };
  }

  return isNonEmptyString(secondSegment)
    ? { relationFieldName: firstSegment, fieldName: secondSegment }
    : undefined;
};
