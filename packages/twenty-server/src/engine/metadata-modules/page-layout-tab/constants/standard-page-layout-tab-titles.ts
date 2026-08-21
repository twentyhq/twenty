import { msg } from '@lingui/core/macro';

// This file exists solely for Lingui string extraction.
// The strings defined here correspond to standard page layout tab titles
// so they appear in the .po catalogs and can be translated at resolve time
// via generateMessageId hash lookups.
export const getStandardPageLayoutTabTitles = () => [
  msg({ message: `Home`, context: 'pageLayoutTab.title' }),
  msg({ message: `Timeline`, context: 'pageLayoutTab.title' }),
  msg({ message: `Tasks`, context: 'pageLayoutTab.title' }),
  msg({ message: `Notes`, context: 'pageLayoutTab.title' }),
  msg({ message: `Files`, context: 'pageLayoutTab.title' }),
  msg({ message: `Emails`, context: 'pageLayoutTab.title' }),
  msg({ message: `Calendar`, context: 'pageLayoutTab.title' }),
  msg({ message: `Note`, context: 'pageLayoutTab.title' }),
  msg({ message: `Flow`, context: 'pageLayoutTab.title' }),
  msg({ message: `Tab 1`, context: 'pageLayoutTab.title' }),
  msg({ message: `Call Recording`, context: 'pageLayoutTab.title' }),
  msg({ message: `Email`, context: 'pageLayoutTab.title' }),
  msg({ message: `Summary`, context: 'pageLayoutTab.title' }),
];
