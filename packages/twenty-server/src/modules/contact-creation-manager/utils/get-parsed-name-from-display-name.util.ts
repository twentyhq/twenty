import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type ParsedName } from 'src/modules/contact-creation-manager/types/parsed-name.type';
import { getParsedNameFromEmailLocalPart } from 'src/modules/contact-creation-manager/utils/get-parsed-name-from-email-local-part.util';

const EMPTY_NAME: ParsedName = { firstName: '', lastName: '' };

export const getParsedNameFromDisplayName = (
  displayName: string,
): ParsedName => {
  const cleaned = displayName
    .trim()
    .replace(/^['"]+|['"]+$/g, '')
    .trim();

  if (!isNonEmptyString(cleaned) || cleaned.includes('@')) return EMPTY_NAME;

  const stripTrailingGroupTag = (input: string): string =>
    input.replace(/:[^:]+$/, '').trim();

  const withGroupTagsStripped = (parsed: ParsedName): ParsedName => ({
    firstName: stripTrailingGroupTag(parsed.firstName),
    lastName: stripTrailingGroupTag(parsed.lastName),
  });

  // Comma-inverted forms: "Last, First", "Last, First Middle", and
  // multi-comma shapes like "Last, First, Jr." or "Last, First, MD" that some
  // address books and ATSes emit. We split on the first comma and treat the
  // remainder as the first name, collapsing any further commas to spaces so
  // the stored firstName never contains a stray comma.
  const commaMatch = cleaned.match(/^([^,]+),\s*(.+)$/);

  if (isDefined(commaMatch)) {
    const lastName = commaMatch[1].trim();
    const firstName = commaMatch[2]
      .trim()
      .replace(/\s*,\s*/g, ' ')
      .replace(/\s+/g, ' ');

    if (isNonEmptyString(firstName) && isNonEmptyString(lastName)) {
      return withGroupTagsStripped({
        firstName,
        lastName,
      });
    }
  }

  const [firstToken, ...rest] = cleaned.split(/\s+/);
  const restAsLastName = rest.join(' ');
  const { firstName: head, lastName: dotTail } =
    getParsedNameFromEmailLocalPart(firstToken);

  if (!isNonEmptyString(dotTail)) {
    return withGroupTagsStripped({
      firstName: head,
      lastName: restAsLastName,
    });
  }

  const dotTailAlreadyInLastName = restAsLastName
    .toLowerCase()
    .startsWith(dotTail.toLowerCase());

  return withGroupTagsStripped({
    firstName: head,
    lastName: dotTailAlreadyInLastName
      ? restAsLastName
      : `${dotTail} ${restAsLastName}`.trim(),
  });
};
