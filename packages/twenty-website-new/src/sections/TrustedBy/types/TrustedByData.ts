import type { TrustedByClientCountLabelType } from './TrustedByClientCountLabel';
import type { TrustedByLogosType } from './TrustedByLogos';
import type { TrustedBySeparatorType } from './TrustedBySeparator';

export type TrustedByDataType = {
  clientCountLabel: TrustedByClientCountLabelType;
  logos: TrustedByLogosType[];
  separator: TrustedBySeparatorType;
};
