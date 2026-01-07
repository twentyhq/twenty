// ARCHIVE, AUDIO, IMAGE, PRESENTATION, SPREADSHEET, TEXT_DOCUMENT, VIDEO, OTHER

export const getFileCategory = (mimeType: string) => {
  const fileCategory: Record<string, string> = {
    'audio/aac': 'AUDIO',
    'audio/amr': 'AUDIO',
    'audio/mpeg': 'AUDIO',
    'audio/mp4': 'AUDIO',
    'audio/ogg': 'AUDIO',
    'text/plain': 'TEXT',
    'application/vnd.ms-excel': 'SPREADSHEET',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      'SPREADSHEET',
    'application/msword': 'TEXT_DOCUMENT',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      'TEXT_DOCUMENT',
    'application/vnd.ms-powerpoint': 'PRESENTATION',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation':
      'PRESENTATION',
    'application/pdf': 'TEXT_DOCUMENT',
    'image/jpeg': 'IMAGE',
    'image/png': 'IMAGE',
    'image/webp': 'IMAGE',
    'video/3gpp': 'VIDEO',
    'video/mp4': 'VIDEO',
  };

  return fileCategory[mimeType];
};
