import { NON_IMPORTABLE_ATTACHMENT_CONTENT_TYPES } from 'src/modules/messaging/message-import-manager/constants/non-importable-attachment-content-types.constant';
import { NON_IMPORTABLE_ATTACHMENT_FILENAME_EXTENSIONS } from 'src/modules/messaging/message-import-manager/constants/non-importable-attachment-filename-extensions.constant';
import { NON_IMPORTABLE_ATTACHMENT_FILENAMES } from 'src/modules/messaging/message-import-manager/constants/non-importable-attachment-filenames.constant';
import { type MessageAttachmentMetadata } from 'src/modules/messaging/message-import-manager/types/message.type';

export const filterImportableMessageAttachments = (
  attachments: MessageAttachmentMetadata[],
): MessageAttachmentMetadata[] =>
  attachments.filter((attachment) => {
    const filename = attachment.filename.trim().toLowerCase();
    const contentType = attachment.contentType
      .split(';')[0]
      .trim()
      .toLowerCase();

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
