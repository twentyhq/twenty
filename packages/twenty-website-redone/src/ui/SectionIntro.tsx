import { styled } from '@linaria/react';

import { spacing } from '@/tokens';

// The intro stack every section shares: eyebrow, heading, optional CTAs,
// with one margin between them. Sections never set this rhythm themselves —
// that is how Problem and FAQ stay identical. Margins, not gap: spacing
// owned by flow survives wrappers and stays one inspectable property.
export const SectionIntro = styled.div`
  display: grid;
  grid-template-columns: 1fr;

  & > * + * {
    margin-top: ${spacing(6)};
  }
`;
