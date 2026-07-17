import { isNonEmptyString } from '@sniptt/guards';

const DISPLAY_NAME_CHARACTERS_REQUIRING_QUOTING = /[()<>[\]:;@\\,."]/;

export const formatEmailAddress = ({
  address,
  name,
}: {
  address: string;
  name?: string;
}): string => {
  if (!isNonEmptyString(name)) {
    return address;
  }

  const requiresQuoting = DISPLAY_NAME_CHARACTERS_REQUIRING_QUOTING.test(name);
  const formattedName = requiresQuoting
    ? `"${name.replace(/[\\"]/g, '\\$&')}"`
    : name;

  return `${formattedName} <${address}>`;
};
