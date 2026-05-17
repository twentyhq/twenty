import { capitalize } from 'twenty-shared/utils';

type ParsedName = { firstName: string; lastName: string };

const stripWrappingQuotes = (input: string): string =>
  input.replace(/^['"]+|['"]+$/g, '');

// Strip ":XXX" trailing group/category tags some mail servers append
// (e.g. "Jane:GROUP" -> "Jane"). Real names don't contain ':'.
const stripColonSuffix = (input: string): string =>
  input.replace(/:[^:]+$/, '').trim();

const parseFromDisplayName = (displayName: string): ParsedName | null => {
  const cleaned = stripWrappingQuotes(displayName.trim()).trim();

  if (cleaned === '') return null;

  // Real names don't contain '@'. Some forwarders stuff the address into the
  // display-name slot (`From: "addr" <addr>`); fall back to handle parsing.
  if (cleaned.includes('@')) return null;

  const parsed = parseCleanedDisplayName(cleaned);

  if (parsed === null) return null;

  return {
    firstName: stripColonSuffix(parsed.firstName),
    lastName: stripColonSuffix(parsed.lastName),
  };
};

const parseCleanedDisplayName = (cleaned: string): ParsedName | null => {
  // "Last, First" — exactly one comma separating two non-empty parts
  const commaMatch = cleaned.match(/^([^,]+),\s*([^,]+)$/);

  if (commaMatch !== null) {
    return {
      firstName: commaMatch[2].trim(),
      lastName: commaMatch[1].trim(),
    };
  }

  const tokens = cleaned.split(/\s+/);

  // Single token with a dot — likely an email-derived name like "john.doe"
  if (tokens.length === 1) {
    const dotParts = tokens[0].split('.').filter((part) => part !== '');

    if (dotParts.length >= 2) {
      return {
        firstName: dotParts[0],
        lastName: dotParts.slice(1).join(' '),
      };
    }

    return { firstName: tokens[0], lastName: '' };
  }

  let firstName = tokens[0];
  let lastName = tokens.slice(1).join(' ');

  // De-synthesize email-derived first names like "John.Doe Doe" or "John.Doe Smith"
  if (firstName.includes('.')) {
    const dotParts = firstName.split('.').filter((part) => part !== '');

    if (dotParts.length >= 2) {
      const dotTail = dotParts.slice(1).join(' ');

      firstName = dotParts[0];

      if (!lastName.toLowerCase().startsWith(dotTail.toLowerCase())) {
        lastName = `${dotTail} ${lastName}`.trim();
      }
    }
  }

  return { firstName, lastName };
};

const parseFromHandle = (handle: string): ParsedName => {
  const localPart = handle.split('@')[0] ?? '';
  const parts = localPart.split('.').filter((part) => part !== '');

  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
};

export function getFirstNameAndLastNameFromHandleAndDisplayName(
  handle: string,
  displayName: string,
): ParsedName {
  const fromDisplay = parseFromDisplayName(displayName ?? '');
  const fromHandle = parseFromHandle(handle ?? '');

  return {
    firstName: capitalize(fromDisplay?.firstName || fromHandle.firstName || ''),
    lastName: capitalize(fromDisplay?.lastName || fromHandle.lastName || ''),
  };
}
