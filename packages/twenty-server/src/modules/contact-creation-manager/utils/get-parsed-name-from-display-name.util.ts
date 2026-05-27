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

  const commaMatch = cleaned.match(/^([^,]+),\s*([^,]+)$/);

  if (isDefined(commaMatch)) {
    return withGroupTagsStripped({
      firstName: commaMatch[2].trim(),
      lastName: commaMatch[1].trim(),
    });
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
