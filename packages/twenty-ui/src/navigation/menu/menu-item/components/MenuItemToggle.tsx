import styled from '@emotion/styled';
import { type IconComponent } from '@ui/display';
import { Toggle, type ToggleSize } from '@ui/input';
import { useId } from 'react';
import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import {
  StyledMenuItemBase,
  StyledMenuItemRightContent,
} from '../internals/components/StyledMenuItemBase';

const StyledToggleContainer = styled.label`
  align-items: center;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export type MenuItemToggleProps = {
  focused?: boolean;
  LeftIcon?: IconComponent;
  withIconContainer?: boolean;
  toggled: boolean;
  text: string;
  className?: string;
  onToggleChange?: (toggled: boolean) => void;
  toggleSize?: ToggleSize;
  disabled?: boolean;
};

export const MenuItemToggle = ({
  focused,
  LeftIcon,
  withIconContainer = false,
  text,
  toggled,
  className,
  onToggleChange,
  toggleSize,
  disabled = false,
}: MenuItemToggleProps) => {
  const instanceId = useId();
  return (
    <StyledMenuItemBase
      className={className}
      focused={focused}
      disabled={disabled}
    >
      <StyledToggleContainer htmlFor={instanceId}>
        <MenuItemLeftContent
          LeftIcon={LeftIcon}
          text={text}
          withIconContainer={withIconContainer}
          disabled={disabled}
        />
        <StyledMenuItemRightContent>
          <Toggle
            id={instanceId}
            value={toggled}
            onChange={disabled ? undefined : onToggleChange}
            toggleSize={toggleSize}
            disabled={disabled}
          />
        </StyledMenuItemRightContent>
      </StyledToggleContainer>
    </StyledMenuItemBase>
  );
};
