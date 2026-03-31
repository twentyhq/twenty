import { TrustedByClientCountLabelType } from "./TrustedByClientCountLabel";
import { TrustedBySeparatorType } from "./TrustedBySeparator"
import { TrustedByLogosType } from "./TrustedByLogos";

export type TrustedByDataType = {
    separator: TrustedBySeparatorType;
    clientCountLabel: TrustedByClientCountLabelType;
    logos: TrustedByLogosType[];
}