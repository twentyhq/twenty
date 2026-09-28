import { isString } from '@sniptt/guards';
import { type Request } from 'express';
import { type AppLocale } from 'twenty-shared/translations';
import { normalizeLocale } from 'twenty-shared/utils';

export const getRequestLocaleFromHeader = (request: Request): AppLocale => {
  const headerLocale = request.headers['x-locale'];

  return normalizeLocale(isString(headerLocale) ? headerLocale : null);
};
