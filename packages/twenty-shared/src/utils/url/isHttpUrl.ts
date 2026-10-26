import { getUrlSafely } from '@/utils/getUrlSafely';
import { isAbsoluteUrl } from '@/utils/url/isAbsoluteUrl';
import { isDefined } from '@/utils/validation/isDefined';

export const isHttpUrl = (url: string): boolean =>
  isAbsoluteUrl(url) && isDefined(getUrlSafely(url));
