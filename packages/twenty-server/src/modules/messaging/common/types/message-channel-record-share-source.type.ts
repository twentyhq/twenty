import { type MessageChannelVisibility } from 'twenty-shared/types';

export type MessageChannelRecordShareSource = {
  messageChannelId: string;
  visibility: MessageChannelVisibility;
  ownerWorkspaceMemberId: string | null;
};
