import type { ProblemDataType } from '@/sections/Problem/types';

export const PROBLEM_DATA: ProblemDataType = {
  eyebrow: { heading: { text: 'The Problem.', fontFamily: 'sans' } },
  heading: [
    { text: 'A custom CRM gives your org an edge, ', fontFamily: 'serif' },
    { text: 'but building one ', fontFamily: 'sans' },
    { text: 'comes with ', fontFamily: 'serif' },
    { text: 'tradeoffs', fontFamily: 'sans' },
  ],
  points: [
    {
      heading: { text: 'The Giant Monolith', fontFamily: 'sans' },
      body: {
        text: 'Proprietary languages, slow deployment cycles, and "black box" logic.',
      },
    },
    {
      heading: { text: 'The In-house Burden', fontFamily: 'sans' },
      body: {
        text: "It's fragile. V1 ships quickly, but maintaining and making changes is a long term burden.",
      },
    },
  ],
};
