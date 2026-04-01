import { TrustedByClientCountLabelType } from './TrustedByClientCountLabel';
import { TrustedByLogosType } from './TrustedByLogos';
import { TrustedBySeparatorType } from './TrustedBySeparator';

export type TrustedByDataType = {
  clientCountLabel: TrustedByClientCountLabelType;
  logos: TrustedByLogosType[];
  separator: TrustedBySeparatorType;
};
