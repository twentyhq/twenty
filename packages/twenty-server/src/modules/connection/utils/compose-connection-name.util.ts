import { isNonEmptyString } from '@sniptt/guards';
import { type FullNameMetadata } from 'twenty-shared/types';

// Matches the format the Folk import already writes, so hand-made and imported
// connections read the same way in lists and search
const CONNECTION_NAME_SEPARATOR = ' ↔ ';

const formatPersonName = (name: FullNameMetadata | null): string =>
  [name?.firstName, name?.lastName].filter(isNonEmptyString).join(' ').trim();

export const composeConnectionName = ({
  personName,
  connectedToName,
}: {
  personName: FullNameMetadata | null;
  connectedToName: FullNameMetadata | null;
}): string | undefined => {
  const formattedPersonName = formatPersonName(personName);
  const formattedConnectedToName = formatPersonName(connectedToName);

  // A one-sided label reads worse than no label, so both ends are required
  if (
    !isNonEmptyString(formattedPersonName) ||
    !isNonEmptyString(formattedConnectedToName)
  ) {
    return undefined;
  }

  return `${formattedPersonName}${CONNECTION_NAME_SEPARATOR}${formattedConnectedToName}`;
};
