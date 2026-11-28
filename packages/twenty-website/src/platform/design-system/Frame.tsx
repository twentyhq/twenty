import { styled } from '@linaria/react';

import { radius, semanticColor } from '@/tokens';

export const Frame = styled.div`
  border: 1px solid ${semanticColor.line};
  border-radius: ${radius(2)};
  // clip, not hidden: hidden makes a scroll box and breaks the sticky
  // parts of the sections shown inside (steppers).
  overflow: clip;
  position: relative;
`;
