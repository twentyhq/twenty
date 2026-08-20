import { msg } from '@lingui/core/macro';

// This file exists solely for Lingui string extraction.
// The strings defined here correspond to standard page layout names
// so they appear in the .po catalogs and can be translated at resolve time
// via generateMessageId hash lookups.
export const getStandardPageLayoutNames = () => [
  msg({ message: `Default Blocklist Layout`, context: 'pageLayout.name' }),
  msg({
    message: `Default Calendar Channel Event Association Layout`,
    context: 'pageLayout.name',
  }),
  msg({ message: `Default Calendar Event Layout`, context: 'pageLayout.name' }),
  msg({
    message: `Default Calendar Event Participant Layout`,
    context: 'pageLayout.name',
  }),
  msg({ message: `Default Call Recording Layout`, context: 'pageLayout.name' }),
  msg({ message: `Default Campaign Layout`, context: 'pageLayout.name' }),
  msg({ message: `Default Company Layout`, context: 'pageLayout.name' }),
  msg({ message: `Default List Layout`, context: 'pageLayout.name' }),
  msg({
    message: `Default Message Channel Message Association Layout`,
    context: 'pageLayout.name',
  }),
  msg({
    message: `Default Message Channel Message Association Message Folder Layout`,
    context: 'pageLayout.name',
  }),
  msg({
    message: `Default Message Participant Layout`,
    context: 'pageLayout.name',
  }),
  msg({ message: `Default Message Thread Layout`, context: 'pageLayout.name' }),
  msg({ message: `Default Note Layout`, context: 'pageLayout.name' }),
  msg({ message: `Default Opportunity Layout`, context: 'pageLayout.name' }),
  msg({ message: `Default Person Layout`, context: 'pageLayout.name' }),
  msg({ message: `Default Task Layout`, context: 'pageLayout.name' }),
  msg({
    message: `Default Workflow Automated Trigger Layout`,
    context: 'pageLayout.name',
  }),
  msg({ message: `Default Workflow Layout`, context: 'pageLayout.name' }),
  msg({ message: `Default Workflow Run Layout`, context: 'pageLayout.name' }),
  msg({
    message: `Default Workflow Version Layout`,
    context: 'pageLayout.name',
  }),
  msg({ message: `My First Dashboard`, context: 'pageLayout.name' }),
];
