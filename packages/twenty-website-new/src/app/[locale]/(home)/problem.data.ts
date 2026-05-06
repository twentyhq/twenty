import { msg } from '@lingui/core/macro';
import type { ProblemDataType } from '@/sections/Problem/types';

export const PROBLEM_DATA: ProblemDataType = {
  eyebrow: { heading: { text: msg`The Problem.`, fontFamily: 'sans' } },
  points: [
    {
      heading: { text: msg`The Giant Monolith`, fontFamily: 'sans' },
      body: {
        text: msg`Proprietary languages, slow deployment cycles, and "black box" logic.`,
      },
    },
    {
      heading: { text: msg`The In-house Burden`, fontFamily: 'sans' },
      body: {
        text: msg`It's fragile. V1 ships quickly, but maintaining and making changes is a long term burden.`,
      },
    },
  ],
};
