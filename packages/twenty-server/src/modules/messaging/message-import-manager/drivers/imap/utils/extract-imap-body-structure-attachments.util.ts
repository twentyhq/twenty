import { isNonEmptyString } from '@sniptt/guards';
import { type MessageStructureObject } from 'imapflow';

import { IMAP_BODY_TEXT_CONTENT_TYPES } from 'src/modules/messaging/message-import-manager/drivers/imap/constants/imap-body-text-content-types.constant';
import { IMAP_MAX_BODY_STRUCTURE_NODES_TO_PROCESS } from 'src/modules/messaging/message-import-manager/drivers/imap/constants/imap-max-body-structure-nodes-to-process.constant';
import { IMAP_SINGLE_PART_MESSAGE_PART_PATH } from 'src/modules/messaging/message-import-manager/drivers/imap/constants/imap-single-part-message-part-path.constant';
import { estimateImapPartDecodedSize } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/estimate-imap-part-decoded-size.util';
import { type MessageAttachmentMetadata } from 'src/modules/messaging/message-import-manager/types/message.type';

export const extractImapBodyStructureAttachments = (
  bodyStructure: MessageStructureObject,
): MessageAttachmentMetadata[] => {
  const attachments: MessageAttachmentMetadata[] = [];
  const nodes: MessageStructureObject[] = [bodyStructure];

  for (
    let nodeIndex = 0;
    nodes.length !== 0 && nodeIndex < IMAP_MAX_BODY_STRUCTURE_NODES_TO_PROCESS;
    nodeIndex++
  ) {
    const node = nodes.shift()!;
    const contentType = node.type.toLowerCase();
    const disposition = node.disposition?.toLowerCase();
    const isAttachmentDisposition = disposition === 'attachment';

    if (
      contentType.startsWith('multipart/') ||
      (contentType === 'message/rfc822' && !isAttachmentDisposition)
    ) {
      nodes.unshift(...(node.childNodes ?? []));
      continue;
    }

    const filename =
      node.dispositionParameters?.filename ?? node.parameters?.name;

    if (
      !isAttachmentDisposition &&
      !isNonEmptyString(filename) &&
      IMAP_BODY_TEXT_CONTENT_TYPES.includes(contentType)
    ) {
      continue;
    }

    attachments.push({
      externalId: node.part ?? IMAP_SINGLE_PART_MESSAGE_PART_PATH,
      filename: filename || 'unnamed-attachment',
      size: estimateImapPartDecodedSize(node),
      contentType,
      isInline: disposition === 'inline' || isNonEmptyString(node.id),
    });
  }

  return attachments;
};
