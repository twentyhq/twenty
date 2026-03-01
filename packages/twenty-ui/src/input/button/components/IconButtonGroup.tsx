import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import { type MouseEvent } from 'react';

import { InsideButton } from '@ui/input/button/components/InsideButton';
import { themeCssVariables } from '@ui/theme';

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
  background-color: ${({ disabled }) =>
    disabled ? 'inherit' : themeCssVariables.background.transparent.lighter};
  border-radius: ${themeCssVariables.border.radius.sm};
  border: 1px solid ${themeCssVariables.border.color.strong};
  gap: 2px;
  padding: 2px;
  backdrop-filter: blur(20px);

  &:hover {
    box-shadow: ${themeCssVariables.boxShadow.light};
  }
`;

export const IconButtonGroup = ({
  iconButtons,
  disabled,
  className,
}: IconButtonGroupProps) => {
  return (
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
};
