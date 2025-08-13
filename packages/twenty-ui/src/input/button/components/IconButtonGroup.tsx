import styled from '@emotion/styled';
import { type IconComponent } from '@ui/display';
import { type MouseEvent } from 'react';

import { InsideButton } from '@ui/input/button/components/InsideButton';

export type IconButtonGroupProps = {
  disabled?: boolean;
  iconButtons: {
    Icon: IconComponent;
    onClick?: (event: MouseEvent<any>) => void;
  }[];
  className?: string;
};

const StyledIconButtonGroupContainer = styled.div<
  Pick<IconButtonGroupProps, 'disabled'>
>`
  display: inline-flex;
  align-items: flex-start;
  background-color: ${({ disabled, theme }) =>
    disabled ? 'inherit' : theme.background.transparent.lighter};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.strong};
  gap: 2px;
  padding: 2px;
  backdrop-filter: blur(20px);

  &:hover {
    box-shadow: ${({ theme }) => theme.boxShadow.light};
  }
`;

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
