import { GmailDefaultMessageCategory } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-default-message-category.type';

export const MESSAGING_GMAIL_EXCLUDED_CATEGORIES = [
  GmailDefaultMessageCategory.promotions,
  GmailDefaultMessageCategory.forums,
  GmailDefaultMessageCategory.social,
  GmailDefaultMessageCategory.updates,
];
