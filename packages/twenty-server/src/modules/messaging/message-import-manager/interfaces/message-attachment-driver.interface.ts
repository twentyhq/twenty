import { type Readable } from 'stream';

import { type FetchMessageAttachmentParams } from 'src/modules/messaging/message-import-manager/types/fetch-message-attachment-params.type';

export type MessageAttachmentDriver = {
  fetchMessageAttachment(
    params: FetchMessageAttachmentParams,
  ): Promise<Readable | null>;
};
