import type { EditorialDataType } from '@/sections/Editorial/types/EditorialData';

export const EDITORIAL_ONE: EditorialDataType = {
  eyebrow: {
    heading: {
      fontFamily: 'sans',
      text: 'What must our CRM do that nobody else can?',
    },
  },
  heading: [
    { fontFamily: 'serif', text: 'Packaged CRMs' },
    { fontFamily: 'sans', text: ' optimize for sameness' },
  ],
  body: [
    {
      text: 'Off-the-shelf CRMs are built for the median workflow. They standardize what an account is, what a pipeline looks like, what stages matter, and what "good" reporting means. They help you keep up with the market, this is beta. But when it is time to generate differentiated value, alpha, they fall short.',
    },
    {
      text: 'When every company runs the same objects, the same lifecycle stages, the same routing logic, and the same prepackaged "AI insights," the CRM stops being an advantage. It becomes a cost of entry. You do not just buy software. You inherit assumptions, assumptions that over time become constraints.',
    },
  ],
};
