import { msg } from '@lingui/core/macro';
import type { EditorialDataType } from '@/sections/Editorial/types/EditorialData';

export const EDITORIAL_ONE: EditorialDataType = {
  eyebrow: {
    heading: {
      fontFamily: 'sans',
      text: msg`The shift`,
    },
  },
  body: [
    {
      text: msg`For twenty years, CRM meant the same thing: a place to log calls, track deals, and pull reports on Friday. The real work happened in people's heads, in Slack threads, in hallway conversations. The CRM kept score. Nobody expected more from it.`,
    },
    {
      text: msg`AI agents are starting to draft outreach, score leads, research accounts, write follow-ups, update deal stages. Every one of these actions reads from and writes to the CRM. The scoreboard became the playbook. The database became the brain.`,
    },
  ],
};
