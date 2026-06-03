import { msg } from '@lingui/core/macro';

// This file exists solely for Lingui string extraction.
// The strings defined here correspond to standard page layout tab titles
// so they appear in the .po catalogs and can be translated at resolve time
// via generateMessageId hash lookups.
export const getStandardPageLayoutTabTitles = () => [
  msg`Home`,
  msg`Timeline`,
  msg`Tasks`,
  msg`Notes`,
  msg`Files`,
  msg`Emails`,
  msg`Calendar`,
  msg`Note`,
  msg`Flow`,
  msg`Tab 1`,
];
