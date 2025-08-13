import { APP_LOCALES } from '../../translations';

export const isValidLocale = (
  value: string | null,
): value is keyof typeof APP_LOCALES => {
  return typeof value === 'string' && value in APP_LOCALES;
};
