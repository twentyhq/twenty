import { getAbsoluteUrl } from '@/utils/url/getAbsoluteUrl';
import { isValidHostname } from '@/utils/url/isValidHostname';
import { z } from 'zod';

export const absoluteUrlSchema = z.string().transform((value, ctx) => {
  const trimmedValue = value.trim();
  const absoluteUrl = getAbsoluteUrl(trimmedValue);

  const valueWithoutProtocol = absoluteUrl
    .replace('https://', '')
    .replace('http://', '')
    .replace('HTTPS://', '')
    .replace('HTTP://', '');

  if (/^\d+(?:\/[a-zA-Z]*)?$/.test(valueWithoutProtocol)) {
    // if the hostname is a number, it's not a valid url
    // if we let URL() parse it, it will throw cast an IP address and we lose the information
    ctx.addIssue({
      code: 'custom',
      message: 'domain is not a valid url',
    });

    return z.NEVER;
  }
  try {
    const url = new URL(absoluteUrl);
    if (isValidHostname(url.hostname)) {
      return absoluteUrl;
    }
    ctx.addIssue({
      code: 'custom',
      message: 'domain is not a valid url',
    });

    return z.NEVER;
  } catch {
    ctx.addIssue({
      code: 'custom',
      message: 'domain is not a valid url',
    });

    return z.NEVER;
  }
});
