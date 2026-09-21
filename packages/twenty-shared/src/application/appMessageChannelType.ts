import { type MessageChannelVisibility } from '../types/MessageChannelVisibility';

// One messaging channel an app owns, bound to one of its connections.
// Returned from `listMessageChannels` and `createMessageChannel`.
//
// The shape lives in twenty-shared so this and the server-side
// `MessageChannelDTO` projection always agree.
export type AppMessageChannel = {
  id: string;
  // The account's identity on the provider, as the provider names it (a
  // LinkedIn member URN, a WhatsApp number). Opaque to Twenty: it is what
  // the app matches inbound payloads against, and what participant handles
  // on this channel are compared to when deciding message direction.
  handle: string;
  // End-user label for the channel. Falls back to `handle` in the UI when null.
  displayName: string | null;
  // How much of a message on this channel other workspace members may read:
  //   'METADATA'         = participants and dates only.
  //   'SUBJECT'          = the above plus the subject.
  //   'SHARE_EVERYTHING' = the above plus the body.
  // The owner of the underlying connection always reads their own messages
  // in full regardless of this value.
  visibility: MessageChannelVisibility;
  // The app connection whose credential this channel speaks through.
  connectedAccountId: string;
  // False pauses the channel without deleting it: ingestion is rejected
  // while it is off, and existing messages stay readable.
  isSyncEnabled: boolean;
};
