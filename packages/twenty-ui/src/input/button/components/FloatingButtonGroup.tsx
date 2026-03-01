import { styled } from '@linaria/react';
import React from 'react';

import {
  type FloatingButtonPosition,
  type FloatingButtonProps,
} from './FloatingButton';
import { themeCssVariables } from '@ui/theme';
import { isDefined } from 'twenty-shared/utils';

const StyledFloatingButtonGroupContainer = styled.div`
  backdrop-filter: blur(20px);
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow:
    0px 2px 4px 0px ${themeCssVariables.background.transparent.light},
    0px 0px 4px 0px ${themeCssVariables.background.transparent.medium};
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
  return (
    <StyledFloatingButtonGroupContainer className={className}>
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
