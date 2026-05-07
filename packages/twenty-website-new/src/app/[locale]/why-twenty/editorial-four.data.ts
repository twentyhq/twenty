import { msg } from '@lingui/core/macro';
import type { EditorialDataType } from '@/sections/Editorial/types/EditorialData';

export const EDITORIAL_FOUR: EditorialDataType = {
  eyebrow: {
    heading: {
      fontFamily: 'sans',
      text: msg`What this means`,
    },
  },
  body: [
    {
      text: msg`You don't buy your deployment pipeline off the shelf. You don't rent your data warehouse from a vendor who decides the schema. You build it, you own it, you iterate on it every week. CRM is going the same way. The teams that treat it as infrastructure they own will compound an advantage every quarter.`,
    },
    {
      text: msg`Tuesday your team learns that deals with a technical champion close 3x faster. Wednesday you add the field, wire up the scoring, adjust the workflow. By Thursday your agents are acting on it. That feedback loop is the edge. And it only works if the CRM is yours.`,
    },
  ],
};
