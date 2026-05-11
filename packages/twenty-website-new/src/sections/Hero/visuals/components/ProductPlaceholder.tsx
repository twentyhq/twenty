'use client';

import { theme } from '@/theme';
import { styled } from '@linaria/react';

const StyledContainer = styled.div`
  background-color: ${theme.colors.secondary.background[5]};
  height: 462px;
  margin-top: ${theme.spacing(6)};
  width: 100%;
`;

export function ProductPlaceholder() {
  return <StyledContainer />;
}
