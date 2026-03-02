import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import { type MouseEvent } from 'react';

import {
  FloatingIconButton,
  type FloatingIconButtonPosition,
  type FloatingIconButtonProps,
} from './FloatingIconButton';
import { themeCssVariables } from '@ui/theme';

const StyledFloatingIconButtonGroupContainer = styled.div`
  backdrop-filter: blur(20px);
  background-color: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-shadow:
    0px 2px 4px 0px ${themeCssVariables.background.transparent.light},
    0px 0px 4px 0px ${themeCssVariables.background.transparent.medium};
  display: inline-flex;
  gap: 2px;
  padding: 2px;
`;

export type FloatingIconButtonGroupProps = Pick<
  FloatingIconButtonProps,
  'className' | 'size'
> & {
  iconButtons: {
    Icon: IconComponent;
    onClick?: (event: MouseEvent<any>) => void;
    isActive?: boolean;
  }[];
};

export const FloatingIconButtonGroup = ({
  iconButtons,
  size,
  className,
}: FloatingIconButtonGroupProps) => {
  return (
    <StyledFloatingIconButtonGroupContainer className={className}>
      {iconButtons.map(({ Icon, onClick, isActive }, index) => {
        const position: FloatingIconButtonPosition =
          iconButtons.length === 1
            ? 'standalone'
            : index === 0
              ? 'left'
              : index === iconButtons.length - 1
                ? 'right'
                : 'middle';

        return (
          <FloatingIconButton
            key={`floating-icon-button-${index}`}
            applyBlur={false}
            applyShadow={false}
            Icon={Icon}
            onClick={onClick}
            position={position}
            size={size}
            isActive={isActive}
          />
        );
      })}
    </StyledFloatingIconButtonGroupContainer>
  );
};
