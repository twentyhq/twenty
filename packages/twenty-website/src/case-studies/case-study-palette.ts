import { type PaletteToken } from '@/tokens';

// Each card draws its halftone cover in one of the four artwork accents,
// cycled by catalog position.
const CASE_STUDY_ACCENTS: readonly PaletteToken[] = [
  'blue',
  'pink',
  'yellow',
  'green',
];

export function getCaseStudyAccent(index: number): PaletteToken {
  return CASE_STUDY_ACCENTS[index % CASE_STUDY_ACCENTS.length];
}
