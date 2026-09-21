// dead/unlicensed/on-premise mailbox/calendar (yes MS returns same codes for calendar don't ask why)
// @see https://learn.microsoft.com/en-us/exchange/client-developer/web-service-reference/responsecode
export const MICROSOFT_PERMANENT_ACCOUNT_ERROR_CODES = [
  'MailboxNotEnabledForRESTAPI',
  'MailboxNotSupportedForRESTAPI',
  'RESTAPINotEnabledForComponentSharedMailbox',
  'ErrorInvalidLicense',
  'ErrorNonExistentMailbox',
  'ErrorAccountDisabled',
  'ErrorOrganizationAccessBlocked',
];
