import { ensureAbsoluteUrl, isNonEmptyString } from 'twenty-shared/utils';
import { z } from 'zod';

import { httpUrlFieldSchema } from './http-url-field-schema';

// Applicants often type "youtube.com/@name": add the scheme instead of refusing it.
const withHttpsScheme = (value: unknown) =>
  isNonEmptyString(value) ? ensureAbsoluteUrl(value.trim()) : value;

// "john@gmail.com" becomes https://john@gmail.com, a URL whose host is gmail.com.
const hasNoCredentials = (value: string) => {
  try {
    return new URL(value).username === '';
  } catch {
    return false;
  }
};

export const lenientHttpUrlFieldSchema = z.preprocess(
  withHttpsScheme,
  httpUrlFieldSchema.refine(hasNoCredentials, { error: 'Invalid URL.' }),
);
