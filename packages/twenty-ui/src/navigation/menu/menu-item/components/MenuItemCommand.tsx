import { type IconComponent } from '@ui/display';
import { MenuItem } from '@ui/navigation/menu/menu-item/components/MenuItem';
import { type ReactNode } from 'react';

export type MenuItemCommandProps = {
  LeftIcon?: IconComponent;
  text: string;
  description?: string;
  hotKeys?: string[];
  className?: string;
  isSelected?: boolean;
  onClick?: () => void;
  RightComponent?: ReactNode;
};

export const MenuItemCommand = ({
  LeftIcon,
  text,
  description,
  hotKeys,
  className,
  isSelected,
  onClick,
  RightComponent,
}: MenuItemCommandProps) => {
  return (
    <MenuItem
      LeftIcon={LeftIcon}
      withIconContainer={true}
      text={text}
      contextualTextPosition="right"
      contextualText={description}
      hotKeys={hotKeys}
      onClick={onClick}
      focused={isSelected}
      RightComponent={RightComponent}
      className={className}
    />
  );
};
