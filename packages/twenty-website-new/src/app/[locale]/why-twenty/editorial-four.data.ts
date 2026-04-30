import type { EditorialDataType } from '@/sections/Editorial/types/EditorialData';

export const EDITORIAL_FOUR: EditorialDataType = {
  eyebrow: {
    heading: {
      fontFamily: 'sans',
      text: 'What this means',
    },
  },
  heading: [
    {
      fontFamily: 'serif',
      text: 'Differentiation now ',
    },
    {
      fontFamily: 'sans',
      text: 'lives in the code you own.',
    },
  ],
  body: [
    {
      text: "You don't buy your deployment pipeline off the shelf. You don't rent your data warehouse from a vendor who decides the schema. You build it, you own it, you iterate on it every week. CRM is going the same way. The teams that treat it as infrastructure they own will compound an advantage every quarter.",
    },
    {
      text: 'Tuesday your team learns that deals with a technical champion close 3x faster. Wednesday you add the field, wire up the scoring, adjust the workflow. By Thursday your agents are acting on it. That feedback loop is the edge. And it only works if the CRM is yours.',
    },
  ],
};
