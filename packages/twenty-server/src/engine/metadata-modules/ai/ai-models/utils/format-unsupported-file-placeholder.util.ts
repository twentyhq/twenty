import { isNonEmptyString } from '@sniptt/guards';

const DEFAULT_ATTACHMENT_FILENAME = 'uploaded_file';
const DEFAULT_ATTACHMENT_MEDIA_TYPE = 'unknown';

export const formatUnsupportedFilePlaceholder = ({
  filename,
  mediaType,
}: {
  filename: string | undefined;
  mediaType: string | undefined;
}): string => {
  const displayedFilename = isNonEmptyString(filename)
    ? filename
    : DEFAULT_ATTACHMENT_FILENAME;
  const displayedMediaType = isNonEmptyString(mediaType)
    ? mediaType
    : DEFAULT_ATTACHMENT_MEDIA_TYPE;

  return `[Attached file: ${displayedFilename} (type: ${displayedMediaType}) — file type is not supported for direct analysis]`;
};
