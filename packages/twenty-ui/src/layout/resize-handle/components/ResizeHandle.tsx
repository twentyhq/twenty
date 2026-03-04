import { styled } from '@linaria/react';
import { type HTMLAttributes } from 'react';
import { themeCssVariables } from '@ui/theme-constants';

const StyledResizeHandleArea = styled.div`
  align-items: center;
  cursor: ns-resize;
  display: flex;
  height: 8px;
  justify-content: center;
  user-select: none;

  &:hover > div {
    background-color: ${themeCssVariables.font.color.tertiary};
  }
`;

const StyledResizeHandleBar = styled.div`
  background-color: ${themeCssVariables.background.quaternary};
  border-radius: ${themeCssVariables.border.radius.pill};
  height: 3px;
  transition: background-color ${themeCssVariables.animation.duration.fast}s;
  width: 32px;
`;

export const ResizeHandle = (props: HTMLAttributes<HTMLDivElement>) => (
  <StyledResizeHandleArea {...props}>
    <StyledResizeHandleBar />
  </StyledResizeHandleArea>
);
