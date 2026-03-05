import { Pill } from '@ui/components/Pill/Pill';
import { Avatar, type IconComponent } from '@ui/display';
import {
  resolveThemeVariable,
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from '@ui/theme-constants';
import { type ReactElement } from 'react';
import { StyledTabHover } from './StyledTabBase';

export type TabContentProps = {
  id: string;
  active?: boolean;
  disabled?: boolean;
  LeftIcon?: IconComponent;
  title?: string;
  logo?: string;
  RightIcon?: IconComponent;
  pill?: string | ReactElement;
  contentSize?: 'sm' | 'md';
  className?: string;
};

export const TabContent = ({
  active,
  disabled,
  LeftIcon,
  title,
  logo,
  RightIcon,
  pill,
  contentSize = 'sm',
  className,
}: TabContentProps) => {
  const iconColor = active
    ? resolveThemeVariable(themeCssVariables.font.color.primary)
    : disabled
      ? resolveThemeVariable(themeCssVariables.font.color.extraLight)
      : resolveThemeVariable(themeCssVariables.font.color.secondary);

  return (
    <StyledTabHover contentSize={contentSize} className={className}>
      {LeftIcon && (
        <LeftIcon
          color={iconColor}
          size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.md)}
        />
      )}
      {logo && <Avatar avatarUrl={logo} size="md" placeholder={title} />}
      {title}
      {RightIcon && (
        <RightIcon
          color={iconColor}
          size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.md)}
        />
      )}
      {pill && (typeof pill === 'string' ? <Pill label={pill} /> : pill)}
    </StyledTabHover>
  );
};
