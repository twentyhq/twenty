import { APP_MESSAGE_HEADER_MESSAGE_ID_PREFIX } from '../constants/AppMessageHeaderMessageIdPrefix';

export const isAppMessageHeaderMessageId = (
  headerMessageId: string | null | undefined,
) => headerMessageId?.startsWith(APP_MESSAGE_HEADER_MESSAGE_ID_PREFIX) ?? false;
