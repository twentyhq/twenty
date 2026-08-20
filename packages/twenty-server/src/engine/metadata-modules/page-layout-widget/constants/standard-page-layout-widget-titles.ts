import { msg } from '@lingui/core/macro';

// This file exists solely for Lingui string extraction.
// The strings defined here correspond to standard page layout widget titles
// so they appear in the .po catalogs and can be translated at resolve time
// via generateMessageId hash lookups.
export const getStandardPageLayoutWidgetTitles = () => [
  msg({ message: `Fields`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Timeline`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Tasks`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Notes`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Files`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Emails`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Calendar`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Note`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Task`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Flow`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Thread`, context: 'pageLayoutWidget.title' }),
  msg({ message: `People`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Opportunities`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Company`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Point of Contact`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Owner`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Workflow`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Untitled Rich Text`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Deals by Company`, context: 'pageLayoutWidget.title' }),
  msg({
    message: `Pipeline Value by Stage`,
    context: 'pageLayoutWidget.title',
  }),
  msg({ message: `Revenue Timeline`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Opportunities by Owner`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Stock market (Iframe)`, context: 'pageLayoutWidget.title' }),
  msg({
    message: `Deals created this month`,
    context: 'pageLayoutWidget.title',
  }),
  msg({
    message: `Deal value created this month`,
    context: 'pageLayoutWidget.title',
  }),
  msg({ message: `Call Recordings`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Email`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Lists`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Members`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Participants`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Recipients`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Summary`, context: 'pageLayoutWidget.title' }),
  msg({ message: `Transcript`, context: 'pageLayoutWidget.title' }),
];
