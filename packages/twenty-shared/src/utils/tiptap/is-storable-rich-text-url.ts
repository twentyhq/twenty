import { isString } from '@sniptt/guards';

import { isSafeUrl } from '@/utils/url/isSafeUrl';

import { RICH_TEXT_URL_MAX_LENGTH } from './rich-text-url-max-length.constant';

export const isStorableRichTextUrl = (url: unknown): url is string =>
  isString(url) && url.length <= RICH_TEXT_URL_MAX_LENGTH && isSafeUrl(url);
