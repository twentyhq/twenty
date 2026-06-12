import type { RefObject } from 'react';

export type HelpedSceneLayoutRefs = {
  cardRefs: RefObject<(HTMLDivElement | null)[]>;
  innerRef: RefObject<HTMLDivElement | null>;
  sectionRef: RefObject<HTMLElement | null>;
};
