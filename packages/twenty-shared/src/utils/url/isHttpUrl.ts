import { getUrlSafely } from '@/utils/getUrlSafely';
import { isAbsoluteUrl } from '@/utils/url/isAbsoluteUrl';
import { isDefined } from '@/primitives/isDefined';

export const isHttpUrl = (url: string): boolean =>
  isAbsoluteUrl(url) && isDefined(getUrlSafely(url));
