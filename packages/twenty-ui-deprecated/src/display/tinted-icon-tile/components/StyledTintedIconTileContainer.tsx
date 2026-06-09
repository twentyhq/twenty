import { styled } from '@linaria/react';
import { themeCssVariables } from '@ui/theme-constants';

export const StyledTintedIconTileContainer = styled.div<{
  $backgroundColor?: string;
  $borderColor?: string;
  $dimension?: string;
}>`
  align-items: center;
  background-color: ${({ $backgroundColor }) =>
    $backgroundColor ?? 'transparent'};
  border: ${({ $borderColor }) =>
    $borderColor ? `1px solid ${$borderColor}` : 'none'};
  border-radius: 4px;
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  height: ${({ $dimension }) => $dimension ?? themeCssVariables.spacing[4]};

  justify-content: center;
  width: ${({ $dimension }) => $dimension ?? themeCssVariables.spacing[4]};
`;
