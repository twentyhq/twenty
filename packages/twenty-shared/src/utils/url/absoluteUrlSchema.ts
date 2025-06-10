import { isValidHostname } from '@/utils/url/isValidHostname';
import { z } from 'zod';

const getAbsoluteUrl = (value: string): string => {
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  return `https://${value}`;
};

export const absoluteUrlSchema = z.string().transform((value, ctx) => {
  const trimmedValue = value.trim();
  const absoluteUrl = getAbsoluteUrl(trimmedValue);

  const valueWithoutProtocol = absoluteUrl
    .replace('https://', '')
    .replace('http://', '');

  if (/^\d+(?:\/[a-zA-Z]*)?$/.test(valueWithoutProtocol)) {
    // if the hostname is a number, it's not a valid url
    // if we let URL() parse it, it will throw cast an IP address and we lose the information
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
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
      code: z.ZodIssueCode.custom,
      message: 'domain is not a valid url',
    });

    return z.NEVER;
  } catch (error) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'domain is not a valid url',
    });

    return z.NEVER;
  }
});
