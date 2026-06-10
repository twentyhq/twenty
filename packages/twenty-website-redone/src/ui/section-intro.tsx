import { styled } from '@linaria/react';

import { spacing } from '@/tokens';

// The intro stack every section shares: eyebrow, heading, optional CTAs,
// with one gap between them. Sections never set this rhythm themselves —
// that is how Problem and FAQ stay identical.
export const SectionIntro = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: ${spacing(6)};
`;
