import { styled } from '@linaria/react';

import { spacing } from '@/tokens';

// A heading and its supporting body, paired at one gap everywhere — the
// hero and section intros compose this instead of choosing their own.
export const HeadingPair = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${spacing(3)};
`;
