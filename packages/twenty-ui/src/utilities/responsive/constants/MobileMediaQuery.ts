import { MOBILE_VIEWPORT } from '@ui/theme';
import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

export const MOBILE_MEDIA_QUERY = doNotTranslate(
  `(max-width: ${MOBILE_VIEWPORT}px)`,
);
