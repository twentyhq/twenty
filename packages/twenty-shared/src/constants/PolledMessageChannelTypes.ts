import { MessageChannelType } from '../types/MessageChannelType';

// Only cron-polled types: push channels (EMAIL_GROUP, APP) and driverless SMS would be scheduled forever.
export const POLLED_MESSAGE_CHANNEL_TYPES = [MessageChannelType.EMAIL] as const;
