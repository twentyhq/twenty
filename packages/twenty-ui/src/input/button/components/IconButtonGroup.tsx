import styled from '@emotion/styled';
import { IconComponent } from '@ui/display';
import { MouseEvent } from 'react';

import { IconButton, IconButtonPosition, IconButtonProps } from './IconButton';

const StyledIconButtonGroupContainer = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
`;

export type IconButtonGroupProps = Pick<
  IconButtonProps,
  'accent' | 'size' | 'variant'
> & {
  iconButtons: {
    Icon: IconComponent;
    onClick?: (event: MouseEvent<any>) => void;
  }[];
  className?: string;
};

export const IconButtonGroup = ({
  accent,
  iconButtons,
  size,
  variant,
  className,
}: IconButtonGroupProps) => (
  <StyledIconButtonGroupContainer className={className}>
    {iconButtons.map(({ Icon, onClick }, index) => {
      const position: IconButtonPosition =
        index === 0
          ? 'left'
          : index === iconButtons.length - 1
            ? 'right'
            : 'middle';

      return (
        <IconButton
          key={index}
          accent={accent}
          Icon={Icon}
          onClick={onClick}
          position={position}
          size={size}
          variant={variant}
        />
      );
    })}
  </StyledIconButtonGroupContainer>
);
