import { NON_IMPORTABLE_ATTACHMENT_CONTENT_TYPES } from 'src/modules/messaging/message-import-manager/constants/non-importable-attachment-content-types.constant';
import { NON_IMPORTABLE_ATTACHMENT_FILENAME_EXTENSIONS } from 'src/modules/messaging/message-import-manager/constants/non-importable-attachment-filename-extensions.constant';
import { NON_IMPORTABLE_ATTACHMENT_FILENAMES } from 'src/modules/messaging/message-import-manager/constants/non-importable-attachment-filenames.constant';
import { type MessageAttachmentMetadata } from 'src/modules/messaging/message-import-manager/types/message.type';
import { normalizeMessageAttachmentContentType } from 'src/modules/messaging/message-import-manager/utils/normalize-message-attachment-content-type.util';

export const filterImportableMessageAttachments = (
  attachments: MessageAttachmentMetadata[],
): MessageAttachmentMetadata[] =>
  attachments.filter((attachment) => {
    const filename = attachment.filename.trim().toLowerCase();
    const contentType = normalizeMessageAttachmentContentType(
      attachment.contentType,
    );

    const isMailSystemFile =
      NON_IMPORTABLE_ATTACHMENT_FILENAMES.includes(filename) ||
      NON_IMPORTABLE_ATTACHMENT_FILENAME_EXTENSIONS.some((extension) =>
        filename.endsWith(extension),
      ) ||
      NON_IMPORTABLE_ATTACHMENT_CONTENT_TYPES.includes(contentType);

    const isInlineImage =
      attachment.isInline && contentType.startsWith('image/');

    return !isMailSystemFile && !isInlineImage;
  });
