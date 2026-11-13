import { isNonEmptyString } from '@sniptt/guards';

const DEFAULT_ATTACHMENT_FILENAME = 'uploaded_file';
const DEFAULT_ATTACHMENT_MEDIA_TYPE = 'unknown';
const UNSUPPORTED_FILE_TYPE_REASON =
  'file type is not supported for direct analysis';

export const formatUnsupportedFilePlaceholder = ({
  filename,
  mediaType,
  reason = UNSUPPORTED_FILE_TYPE_REASON,
}: {
  filename: string | undefined;
  mediaType: string | undefined;
  reason?: string;
}): string => {
  const displayedFilename = isNonEmptyString(filename)
    ? filename
    : DEFAULT_ATTACHMENT_FILENAME;
  const displayedMediaType = isNonEmptyString(mediaType)
    ? mediaType
    : DEFAULT_ATTACHMENT_MEDIA_TYPE;

  return `[Attached file: ${displayedFilename} (type: ${displayedMediaType}) — ${reason}]`;
};
