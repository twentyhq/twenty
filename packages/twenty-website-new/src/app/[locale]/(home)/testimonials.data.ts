import { msg } from '@lingui/core/macro';
import type { TestimonialsDataType } from '@/sections/Testimonials/types';

export const TESTIMONIALS_DATA: TestimonialsDataType = {
  eyebrow: {
    heading: { text: msg`They are the real sales`, fontFamily: 'sans' },
  },
  testimonials: [
    {
      heading: {
        text: msg`The flexibility is really what made the difference. Our needs evolve very fast. I discover a new need and in two clicks I can address it. That is a real advantage when you are moving quickly.`,
        fontFamily: 'sans',
      },
      author: {
        name: { text: msg`Olivier Reinaud` },
        designation: { text: msg`Co-founder at NetZero` },
      },
    },
    {
      heading: {
        text: msg`We didn't want to patch over the problem. We wanted to build something institutions could rely on at scale, and that meant starting from a foundation solid enough to support the full complexity of what we had in mind.`,
        fontFamily: 'sans',
      },
      author: {
        name: { text: msg`Amrendra Pratap Singh` },
        designation: { text: msg`VP of Engineering at W3villa Technologies` },
      },
    },
    {
      heading: {
        text: msg`It is just such a nicer experience than dealing with a Salesforce or a HubSpot. My mission has been to get every tool API-accessible, so everything talks to each other. Twenty made that possible in a way older CRM platforms simply do not.`,
        fontFamily: 'sans',
      },
      author: {
        name: { text: msg`Justin Beadle` },
        designation: {
          text: msg`Director of Digital and Information, Elevate Consulting`,
        },
      },
    },
  ],
};
