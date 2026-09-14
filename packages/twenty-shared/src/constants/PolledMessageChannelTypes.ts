import { MessageChannelType } from '../types/MessageChannelType';

// The email import pipeline polls providers on a cron. Only types whose
// messages are fetched that way belong here: push-delivered channels
// (EMAIL_GROUP, APP) would be scheduled forever against a driver that
// cannot list their messages. Listing the polled types rather than
// excluding the others keeps a newly added type out of the pipeline
// until someone deliberately opts it in.
export const POLLED_MESSAGE_CHANNEL_TYPES = [
  MessageChannelType.EMAIL,
  MessageChannelType.SMS,
] as const;
