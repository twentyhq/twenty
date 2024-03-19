type VisibilityValue = 'METADATA' | 'SUBJECT' | 'SHARE_EVERYTHING';

const visibilityValues: VisibilityValue[] = [
  'METADATA',
  'SUBJECT',
  'SHARE_EVERYTHING',
];

export const maxVisibility = (
  visibilityValue1: VisibilityValue,
  visibilityValue2: VisibilityValue,
) => {
  return visibilityValues[
    Math.max(
      visibilityValues.indexOf(visibilityValue1),
      visibilityValues.indexOf(visibilityValue2),
    )
  ];
};
