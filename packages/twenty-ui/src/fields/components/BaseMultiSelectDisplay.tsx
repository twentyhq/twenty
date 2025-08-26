import { styled } from '@linaria/react';
import { THEME_COMMON } from '@ui/theme';

const spacing1 = THEME_COMMON.spacing(1);

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${spacing1};
  justify-content: flex-start;

  max-width: 100%;

  overflow: hidden;

  width: 100%;
`;

export const BaseMultiSelectDisplay = StyledContainer;
