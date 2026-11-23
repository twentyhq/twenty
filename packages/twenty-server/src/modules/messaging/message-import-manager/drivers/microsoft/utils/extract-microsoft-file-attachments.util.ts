import { isNonEmptyString } from '@sniptt/guards';

import { MICROSOFT_GRAPH_FILE_ATTACHMENT_ODATA_TYPE } from 'src/modules/messaging/message-import-manager/drivers/microsoft/constants/microsoft-graph-file-attachment-odata-type.constant';
import { type MicrosoftGraphMessageAttachment } from 'src/modules/messaging/message-import-manager/drivers/microsoft/types/microsoft-graph-message-attachment.type';
import { type MessageAttachmentMetadata } from 'src/modules/messaging/message-import-manager/types/message.type';

export const extractMicrosoftFileAttachments = (
  attachments: MicrosoftGraphMessageAttachment[] | undefined,
): MessageAttachmentMetadata[] =>
  (attachments ?? []).flatMap((attachment) => {
    if (
      attachment['@odata.type'] !==
        MICROSOFT_GRAPH_FILE_ATTACHMENT_ODATA_TYPE ||
      !isNonEmptyString(attachment.id) ||
      !isNonEmptyString(attachment.name)
    ) {
      return [];
    }

    return [
      {
        externalId: attachment.id,
        filename: attachment.name,
        size: attachment.size ?? 0,
        contentType: attachment.contentType ?? '',
        isInline: attachment.isInline ?? false,
      },
    ];
  });
