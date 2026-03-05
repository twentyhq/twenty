import { IconChevronRight, type IconComponent } from '@ui/display';
import {
  resolveThemeVariable,
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';
import { MenuItemLeftContent } from '../internals/components/MenuItemLeftContent';
import {
  StyledMenuItemBase,
  StyledMenuItemLeftContent,
} from '../internals/components/StyledMenuItemBase';

export type MenuItemNavigateProps = {
  LeftIcon?: IconComponent;
  withIconContainer?: boolean;
  text: string;
  onClick?: () => void;
  className?: string;
};

export const MenuItemNavigate = ({
  LeftIcon,
  withIconContainer = false,
  text,
  className,
  onClick,
}: MenuItemNavigateProps) => {
  return (
    <StyledMenuItemBase onClick={onClick} className={className}>
      <StyledMenuItemLeftContent>
        <MenuItemLeftContent
          LeftIcon={LeftIcon}
          text={text}
          withIconContainer={withIconContainer}
        />
      </StyledMenuItemLeftContent>
      <IconChevronRight
        size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.sm)}
        color={resolveThemeVariable(themeCssVariables.font.color.tertiary)}
      />
    </StyledMenuItemBase>
  );
};
