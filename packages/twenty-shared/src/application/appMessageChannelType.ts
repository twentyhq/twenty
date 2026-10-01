import { type MessageChannelVisibility } from '../types/MessageChannelVisibility';

export type AppMessageChannel = {
  id: string;
  // Provider identity (LinkedIn URN, WhatsApp number) that inbound payloads and participant handles are matched against.
  handle: string;
  // Falls back to `handle` in the UI when null.
  displayName: string | null;
  // The connection owner always reads their own messages in full, whatever this is set to.
  visibility: MessageChannelVisibility;
  connectedAccountId: string;
  // False rejects ingestion without deleting the channel; existing messages stay readable.
  isSyncEnabled: boolean;
};
