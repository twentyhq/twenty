import { type PhoneCountryOption } from '../types/PhoneCountryOption';

export const getPhoneCountryOptionLabel = ({
  label,
  callingCode,
}: PhoneCountryOption) => `${label} (+${callingCode})`;
