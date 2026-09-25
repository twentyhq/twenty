import { isNonEmptyString } from '@sniptt/guards';

export const capitalize = (stringToCapitalize: string) => {
  if (!isNonEmptyString(stringToCapitalize)) return '';

  return (
    stringToCapitalize.charAt(0).toUpperCase() + stringToCapitalize.slice(1)
  );
};
