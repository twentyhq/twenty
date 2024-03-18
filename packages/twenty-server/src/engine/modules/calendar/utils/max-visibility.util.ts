const visibilityValues = {
  METADATA: 0,
  SUBJECT: 1,
  SHARE_EVERYTHING: 2,
};

type VisibilityValue = 'METADATA' | 'SUBJECT' | 'SHARE_EVERYTHING';

export const maxVisibility = (
  visibilityValue1: VisibilityValue,
  visibilityValue2: VisibilityValue,
) => {
  return Math.max(
    visibilityValues[visibilityValue1],
    visibilityValues[visibilityValue2],
  );
};
