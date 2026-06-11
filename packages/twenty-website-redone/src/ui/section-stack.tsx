import { styled } from '@linaria/react';

import { mediaUp, spacing } from '@/tokens';

// The gap between a section's intro and its content block: one value pair
// across the site (Problem, ThreeCards, FAQ, and onward).
export const SectionStack = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${spacing(10)};

  ${mediaUp('md')} {
    row-gap: ${spacing(20)};
  }
`;
