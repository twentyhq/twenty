import { isDomain } from 'src/utils/url/isDomain';
import { z } from 'zod';

export const absoluteUrlSchema = z
  .string()
  .url()
  .or(
    z
      .string()
      .transform((value) => {
        try {
          const url = `https://${value}`.trim();
          const parsedUrl = new URL(url);

          if (!isDomain(parsedUrl.hostname)) {
            return '';
          }
          return url;
        } catch {
          return '';
        }
      })
      .pipe(z.string().url()),
  )
  .or(z.literal(''));
