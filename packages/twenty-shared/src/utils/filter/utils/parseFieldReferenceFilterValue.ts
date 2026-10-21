import { isNonEmptyString } from '@sniptt/guards';

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

  if (secondSegment === undefined) {
    return { fieldName: firstSegment };
  }

  return isNonEmptyString(secondSegment)
    ? { relationFieldName: firstSegment, fieldName: secondSegment }
    : undefined;
};
