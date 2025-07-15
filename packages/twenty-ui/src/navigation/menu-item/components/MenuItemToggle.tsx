import styled from '@emotion/styled';
import { IconComponent } from '@ui/display';
import { Toggle, ToggleSize } from '@ui/input';
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

type MenuItemToggleProps = {
  focused?: boolean;
  LeftIcon?: IconComponent;
  toggled: boolean;
  text: string;
  className?: string;
  onToggleChange?: (toggled: boolean) => void;
  toggleSize?: ToggleSize;
};

export const MenuItemToggle = ({
  focused,
  LeftIcon,
  text,
  toggled,
  className,
  onToggleChange,
  toggleSize,
}: MenuItemToggleProps) => {
  const instanceId = useId();
  return (
    <StyledMenuItemBase className={className} focused={focused}>
      <StyledToggleContainer htmlFor={instanceId}>
        <MenuItemLeftContent LeftIcon={LeftIcon} text={text} />
        <StyledMenuItemRightContent>
          <Toggle
            id={instanceId}
            value={toggled}
            onChange={onToggleChange}
            toggleSize={toggleSize}
          />
        </StyledMenuItemRightContent>
      </StyledToggleContainer>
    </StyledMenuItemBase>
  );
};
