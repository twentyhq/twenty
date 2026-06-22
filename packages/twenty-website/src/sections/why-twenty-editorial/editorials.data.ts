import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type WhyTwentyEditorial = {
  align: 'left' | 'right';
  eyebrow: MessageDescriptor;
  heading: MessageDescriptor;
  id: string;
  paragraphs: readonly [MessageDescriptor, MessageDescriptor];
};

export const WHY_TWENTY_EDITORIALS: readonly WhyTwentyEditorial[] = [
  {
    align: 'left',
    eyebrow: msg`The shift`,
    heading: msg`CRM was a ledger. *AI turned it into an operating system.*`,
    id: 'shift',
    paragraphs: [
      msg`For twenty years, CRM meant the same thing: a place to log calls, track deals, and pull reports on Friday. The real work happened in people's heads, in Slack threads, in hallway conversations. The CRM kept score. Nobody expected more from it.`,
      msg`AI agents are starting to draft outreach, score leads, research accounts, write follow-ups, update deal stages. Every one of these actions reads from and writes to the CRM. The scoreboard became the playbook. The database became the brain.`,
    ],
  },
  {
    align: 'right',
    eyebrow: msg`What this means`,
    heading: msg`Differentiation now *lives in the code you own.*`,
    id: 'meaning',
    paragraphs: [
      msg`You don't buy your deployment pipeline off the shelf. You don't rent your data warehouse from a vendor who decides the schema. You build it, you own it, you iterate on it every week. CRM is going the same way. The teams that treat it as infrastructure they own will compound an advantage every quarter.`,
      msg`Tuesday your team learns that deals with a technical champion close 3x faster. Wednesday you add the field, wire up the scoring, adjust the workflow. By Thursday your agents are acting on it. That feedback loop is the edge. And it only works if the CRM is yours.`,
    ],
  },
  {
    align: 'left',
    eyebrow: msg`The opportunity`,
    heading: msg`Build it in an afternoon. *AI made the gap that small.*`,
    id: 'opportunity',
    paragraphs: [
      msg`A year ago, customizing your CRM meant hiring a Salesforce consultant, learning Apex, waiting months. The gap between "I want this" and "it's live" was measured in quarters and invoices. So people settled. They bent their process to fit the tool and called it adoption.`,
      msg`Now a developer can describe what they want to Claude Code and have a working app in an afternoon. A custom object, a scoring workflow, a new view, an integration. The bottleneck isn't building anymore. It's whether your platform lets you.`,
    ],
  },
];
