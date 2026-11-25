export const normalizeMessageAttachmentContentType = (
  contentType: string,
): string => contentType.split(';')[0].trim().toLowerCase();
