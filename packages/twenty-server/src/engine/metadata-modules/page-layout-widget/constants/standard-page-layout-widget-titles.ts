import { t } from '@lingui/core/macro';

// This file exists solely for Lingui string extraction.
// The strings defined here correspond to standard page layout widget titles
// so they appear in the .po catalogs and can be translated at resolve time
// via generateMessageId hash lookups.
export const getStandardPageLayoutWidgetTitles = () => [
  t`Fields`,
  t`Timeline`,
  t`Tasks`,
  t`Notes`,
  t`Files`,
  t`Emails`,
  t`Calendar`,
  t`Note`,
  t`Task`,
  t`Flow`,
];
