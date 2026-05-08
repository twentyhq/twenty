import { msg } from '@lingui/core/macro';
import type { EditorialDataType } from '@/sections/Editorial/types/EditorialData';

export const EDITORIAL_THREE: EditorialDataType = {
  eyebrow: {
    heading: { fontFamily: 'sans', text: msg`The opportunity` },
  },
  body: [
    {
      text: msg`A year ago, customizing your CRM meant hiring a Salesforce consultant, learning Apex, waiting months. The gap between "I want this" and "it\'s live" was measured in quarters and invoices. So people settled. They bent their process to fit the tool and called it adoption.`,
    },
    {
      text: msg`Now a developer can describe what they want to Claude Code and have a working app in an afternoon. A custom object, a scoring workflow, a new view, an integration. The bottleneck isn't building anymore. It's whether your platform lets you.`,
    },
  ],
};
