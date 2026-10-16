import { type AppLocale } from '@/translations/constants/AppLocales';

export type ApplicationTranslationSyncAction = {
  type: 'create' | 'update' | 'delete';
  metadataName: 'applicationTranslation';
  locale: AppLocale;
  diff: Record<string, { before: string | null; after: string | null }>;
};
