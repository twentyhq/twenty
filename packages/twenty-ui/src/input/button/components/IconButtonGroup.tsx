import styled from '@emotion/styled';
import { IconComponent } from '@ui/display';
import { MouseEvent } from 'react';

import { IconButtonProps } from '@ui/input';
import { InsideButton } from '@ui/input/button/components/InsideButton';

const StyledIconButtonGroupContainer = styled.div<{ disabled?: boolean }>`
  display: inline-flex;
  align-items: flex-start;
  background-color: ${({ disabled, theme }) =>
    disabled ? 'inherit' : theme.background.transparent.lighter};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  gap: 2px;
  padding: 2px;
  backdrop-filter: blur(20px);

  &:hover {
    box-shadow: ${({ theme }) => theme.boxShadow.light};
  }
`;

export type IconButtonGroupProps = Pick<
  IconButtonProps,
  'accent' | 'size' | 'variant' | 'disabled'
> & {
  iconButtons: {
    Icon: IconComponent;
    onClick?: (event: MouseEvent<any>) => void;
  }[];
  className?: string;
};

export const IconButtonGroup = ({
  iconButtons,
  disabled,
  className,
}: IconButtonGroupProps) => (
  <StyledIconButtonGroupContainer className={className} disabled={disabled}>
    {iconButtons.map(({ Icon, onClick }, index) => {
      return (
        <InsideButton
          key={index}
          Icon={Icon}
          onClick={onClick}
          disabled={disabled}
        />
      );
    })}
  </StyledIconButtonGroupContainer>
);
