import { styled } from '@linaria/react';
import React, { useContext } from 'react';

import {
  type FloatingButtonPosition,
  type FloatingButtonProps,
} from './FloatingButton';
import { ThemeContext, type ThemeType } from '@ui/theme';
import { isDefined } from 'twenty-shared/utils';

const StyledFloatingButtonGroupContainer = styled.div<{
  theme: ThemeType;
}>`
  backdrop-filter: blur(20px);
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) =>
    `0px 2px 4px 0px ${theme.background.transparent.light}, 0px 0px 4px 0px ${theme.background.transparent.medium}`};
  display: inline-flex;
`;

export type FloatingButtonGroupProps = Pick<FloatingButtonProps, 'size'> & {
  children: React.ReactElement[];
  className?: string;
};

export const FloatingButtonGroup = ({
  children,
  size,
  className,
}: FloatingButtonGroupProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledFloatingButtonGroupContainer theme={theme} className={className}>
      {React.Children.map(children, (child, index) => {
        let position: FloatingButtonPosition;

        if (index === 0) {
          position = 'left';
        } else if (index === children.length - 1) {
          position = 'right';
        } else {
          position = 'middle';
        }

        const additionalProps: any = {
          position,
          size,
          applyShadow: false,
          applyBlur: false,
        };

        if (isDefined(size)) {
          additionalProps.size = size;
        }

        return React.cloneElement(child, additionalProps);
      })}
    </StyledFloatingButtonGroupContainer>
  );
};
