import { type ReactNode } from 'react';

export type PhoneCountryOption = {
  value: string;
  label: string;
  callingCode: string;
  flag: ReactNode;
};
