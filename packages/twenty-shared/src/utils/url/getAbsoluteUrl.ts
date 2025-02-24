import { absoluteUrlSchema } from 'src/utils/url/absoluteUrlSchema';

export const getAbsoluteUrl = (url: string) => {
  try {
    return absoluteUrlSchema.parse(url);
  } catch {
    return '';
  }
};
