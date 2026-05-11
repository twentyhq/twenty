import { msg } from '@lingui/core/macro';
import type { TestimonialCardType } from '@/sections/Testimonials';

export const HOME_TESTIMONIALS: TestimonialCardType[] = [
  {
    heading: msg`The flexibility is really what made the difference. Our needs evolve very fast. I discover a new need and in two clicks I can address it. That is a real advantage when you are moving quickly.`,
    author: {
      name: msg`Olivier Reinaud`,
      designation: msg`Co-founder at NetZero`,
    },
  },
  {
    heading: msg`We didn't want to patch over the problem. We wanted to build something institutions could rely on at scale, and that meant starting from a foundation solid enough to support the full complexity of what we had in mind.`,
    author: {
      name: msg`Amrendra Pratap Singh`,
      designation: msg`VP of Engineering at W3villa Technologies`,
    },
  },
  {
    heading: msg`It is just such a nicer experience than dealing with a Salesforce or a HubSpot. My mission has been to get every tool API-accessible, so everything talks to each other. Twenty made that possible in a way older CRM platforms simply do not.`,
    author: {
      name: msg`Justin Beadle`,
      designation: msg`Director of Digital and Information, Elevate Consulting`,
    },
  },
];
