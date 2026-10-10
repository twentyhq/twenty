import { msg } from '@lingui/core/macro';

// Exists solely so Lingui extracts these into the .po catalogs for resolve-time translation
export const getStandardPageLayoutTabTitles = () => [
  msg({ message: `Home`, context: 'pageLayoutTab.title' }),
  msg({ message: `Timeline`, context: 'pageLayoutTab.title' }),
  msg({ message: `Tasks`, context: 'pageLayoutTab.title' }),
  msg({ message: `Notes`, context: 'pageLayoutTab.title' }),
  msg({ message: `Files`, context: 'pageLayoutTab.title' }),
  msg({ message: `Emails`, context: 'pageLayoutTab.title' }),
  msg({ message: `Calendar`, context: 'pageLayoutTab.title' }),
  msg({ message: `Note`, context: 'pageLayoutTab.title' }),
  msg({ message: `Members`, context: 'pageLayoutTab.title' }),
  msg({ message: `Flow`, context: 'pageLayoutTab.title' }),
  msg({ message: `Tab 1`, context: 'pageLayoutTab.title' }),
  msg({ message: `Call Recording`, context: 'pageLayoutTab.title' }),
  msg({ message: `Email`, context: 'pageLayoutTab.title' }),
  msg({ message: `Summary`, context: 'pageLayoutTab.title' }),
  msg({ message: `Fields`, context: 'pageLayoutTab.title' }),
  msg({ message: `Chat`, context: 'pageLayoutTab.title' }),
  msg({ message: `Task`, context: 'pageLayoutTab.title' }),
  msg({ message: `Thread`, context: 'pageLayoutTab.title' }),
];
