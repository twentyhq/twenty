import {
  StyledMenuItemBase,
  StyledMenuItemIconCheck,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';

import { Tag } from '@ui/components';
import { type IconComponent } from '@ui/display';
import {
  type ThemeColor,
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';
import { StyledMenuItemSelectWrapper } from './MenuItemSelect';

type MenuItemSelectTagProps = {
  selected?: boolean;
  focused?: boolean;
  isKeySelected?: boolean;
  className?: string;
  onClick?: () => void;
  color: ThemeColor | 'transparent';
  text: string;
  variant?: 'solid' | 'outline';
  LeftIcon?: IconComponent | null;
};

export const MenuItemSelectTag = ({
  color,
  selected,
  focused,
  isKeySelected,
  className,
  onClick,
  text,
  variant = 'solid',
  LeftIcon,
}: MenuItemSelectTagProps) => {
  return (
    <StyledMenuItemSelectWrapper focused={focused}>
      <StyledMenuItemBase
        onClick={onClick}
        className={className}
        focused={focused}
        isKeySelected={isKeySelected}
      >
        <StyledMenuItemLeftContent>
          <Tag
            variant={variant}
            color={color}
            text={text}
            Icon={LeftIcon ?? undefined}
          />
        </StyledMenuItemLeftContent>
        {selected && (
          <StyledMenuItemIconCheck
            size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.md)}
          />
        )}
      </StyledMenuItemBase>
    </StyledMenuItemSelectWrapper>
  );
};
