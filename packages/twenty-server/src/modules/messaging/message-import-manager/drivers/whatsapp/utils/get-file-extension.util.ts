// Reference: https://developers.facebook.com/documentation/business-messaging/whatsapp/business-phone-numbers/media#supported-media-types

export const getFileExtension = (mimeType: string) => {
  const extensions: Record<string, string> = {
    'audio/aac': '.aac',
    'audio/amr': '.amr',
    'audio/mpeg': '.mp3',
    'audio/mp4': '.mp4',
    'audio/ogg': '.ogg',
    'text/plain': '.text',
    'application/vnd.ms-excel': '.xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      '.xlsx',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      '.docx',
    'application/vnd.ms-powerpoint': '.ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      '.pptx',
    'application/pdf': '.pdf',
    'image/jpeg': '.jpeg',
    'image/png': '.png',
    'image/webp': '.webp',
    'video/3gpp': '.3gp',
    'video/mp4': '.mp4',
  };

  return extensions[mimeType];
};
