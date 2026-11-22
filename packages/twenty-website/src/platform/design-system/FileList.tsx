import { styled } from '@linaria/react';

import { spacing } from '@/tokens';

export const FileList = styled.ul`
  list-style: none;

  & > * + * {
    margin-top: ${spacing(1)};
  }
`;
