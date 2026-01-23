import { APP_LOCALES } from '@/translations/constants/AppLocales';

type AppLocale = keyof typeof APP_LOCALES;

export const isValidLocale = (value: string | null): value is AppLocale =>
  value !== null && value in APP_LOCALES;
