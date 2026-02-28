import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import { type MouseEvent, useContext } from 'react';

import {
  FloatingIconButton,
  type FloatingIconButtonPosition,
  type FloatingIconButtonProps,
} from './FloatingIconButton';
import { ThemeContext, type ThemeType } from '@ui/theme';

const StyledFloatingIconButtonGroupContainer = styled.div<{
  theme: ThemeType;
}>`
  backdrop-filter: blur(20px);
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) =>
    `0px 2px 4px 0px ${theme.background.transparent.light}, 0px 0px 4px 0px ${theme.background.transparent.medium}`};
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
  const { theme } = useContext(ThemeContext);

  return (
    <StyledFloatingIconButtonGroupContainer theme={theme} className={className}>
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
