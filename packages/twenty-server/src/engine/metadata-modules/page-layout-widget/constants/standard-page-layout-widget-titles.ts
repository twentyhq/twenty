import { msg } from '@lingui/core/macro';

// This file exists solely for Lingui string extraction.
// The strings defined here correspond to standard page layout widget titles
// so they appear in the .po catalogs and can be translated at resolve time
// via generateMessageId hash lookups.
export const getStandardPageLayoutWidgetTitles = () => [
  msg`Fields`,
  msg`Timeline`,
  msg`Tasks`,
  msg`Notes`,
  msg`Files`,
  msg`Emails`,
  msg`Calendar`,
  msg`Note`,
  msg`Task`,
  msg`Flow`,
  msg`Thread`,
  msg`People`,
  msg`Opportunities`,
  msg`Company`,
  msg`Point of Contact`,
  msg`Owner`,
  msg`Workflow`,
  msg`Untitled Rich Text`,
  msg`Deals by Company`,
  msg`Pipeline Value by Stage`,
  msg`Revenue Timeline`,
  msg`Opportunities by Owner`,
  msg`Stock market (Iframe)`,
  msg`Deals created this month`,
  msg`Deal value created this month`,
];
