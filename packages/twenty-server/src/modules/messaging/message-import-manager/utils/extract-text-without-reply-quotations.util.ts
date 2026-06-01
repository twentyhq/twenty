import { isNonEmptyString } from '@sniptt/guards';
import EmailReplyParser from 'email-reply-parser';

export const extractTextWithoutReplyQuotations = (text: string): string => {
  const visibleText = new EmailReplyParser().read(text).getVisibleText();

  return isNonEmptyString(visibleText.trim()) ? visibleText : text;
};
