import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export type ProblemPoint = {
  heading: MessageDescriptor;
  body: MessageDescriptor;
};

export const PROBLEM_POINTS: readonly ProblemPoint[] = [
  {
    heading: msg`The Giant Monolith`,
    body: msg`Proprietary languages, slow deployment cycles, and "black box" logic.`,
  },
  {
    heading: msg`The In-house Burden`,
    body: msg`It's fragile. V1 ships quickly, but maintaining and making changes is a long term burden.`,
  },
];
