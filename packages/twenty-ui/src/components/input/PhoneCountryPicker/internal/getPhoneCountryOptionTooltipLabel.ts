import { type PhoneCountryOption } from '../types/PhoneCountryOption';

const LEFT_TO_RIGHT_ISOLATE = '\u2066';
const POP_DIRECTIONAL_ISOLATE = '\u2069';

export const getPhoneCountryOptionTooltipLabel = ({
  label,
  callingCode,
}: Pick<PhoneCountryOption, 'label' | 'callingCode'>) =>
  `${label} (${LEFT_TO_RIGHT_ISOLATE}+${callingCode}${POP_DIRECTIONAL_ISOLATE})`;
