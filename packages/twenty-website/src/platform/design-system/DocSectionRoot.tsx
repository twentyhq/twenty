import { styled } from '@linaria/react';

import { spacing } from '@/tokens';

// One titled section of a component page, reachable from the table of contents.
export const DocSectionRoot = styled.div`
  padding-top: ${spacing(12)};
  scroll-margin-top: ${spacing(28)};

  & > * + * {
    margin-top: ${spacing(4)};
  }
`;
