import { isNonEmptyString } from '@sniptt/guards';
import EmailReplyParser from 'email-reply-parser';

// email-reply-parser matches From:/Von:/De:/Van:/Da: but not Danish/Norwegian Fra:.
// Require a same-line <email>. Case-sensitive, so "fra: kl 10" is left alone.
const LOCALIZED_OUTLOOK_FROM_HEADER =
  /^[ \t]*Fra([ \t]*:.+(?:\[|<).+(?:\]|>))/gm;

export const extractTextWithoutReplyQuotations = (text: string): string => {
  const textWithEnglishOutlookFromHeader = text.replace(
    LOCALIZED_OUTLOOK_FROM_HEADER,
    'From$1',
  );

  const fragments = new EmailReplyParser()
    .read(textWithEnglishOutlookFromHeader)
    .getFragments();

  const hasQuotedFragment = fragments.some((fragment) => fragment.isQuoted());

  if (!hasQuotedFragment) {
    return text;
  }

  const textWithoutQuotations = fragments
    .filter((fragment) => !fragment.isQuoted())
    .map((fragment) => fragment.getContent())
    .join('\n');

  return isNonEmptyString(textWithoutQuotations.trim())
    ? textWithoutQuotations
    : text;
};
