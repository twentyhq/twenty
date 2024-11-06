import styled from '@emotion/styled';
import React, { ReactNode } from 'react';

import { isDefined } from '@ui/utilities';

import { ButtonPosition, ButtonProps } from './Button';

const StyledButtonGroupContainer = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
`;

export type ButtonGroupProps = Pick<
  ButtonProps,
  'variant' | 'size' | 'accent'
> & {
  className?: string;
  children: ReactNode[];
};

export const ButtonGroup = ({
  className,
  children,
  variant,
  size,
  accent,
}: ButtonGroupProps) => (
  <StyledButtonGroupContainer className={className}>
    {React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return null;

      let position: ButtonPosition;

      if (index === 0) {
        position = 'left';
      } else if (index === children.length - 1) {
        position = 'right';
      } else {
        position = 'middle';
      }

      const additionalProps: any = { position, variant, accent, size };

      if (isDefined(variant)) {
        additionalProps.variant = variant;
      }

      if (isDefined(accent)) {
        additionalProps.variant = variant;
      }

      if (isDefined(size)) {
        additionalProps.size = size;
      }

      return React.cloneElement(child, additionalProps);
    })}
  </StyledButtonGroupContainer>
);
