import { Pill } from '@ui/data-display/Pill/Pill';
import { Avatar } from '@ui/data-display';
import { type IconComponent } from '@ui/icon';
import { ThemeContext } from '@ui/theme-constants';
import { type ReactElement, useContext } from 'react';
import { StyledTabHover } from '@ui/input/TabButton/parts/StyledTabBase';

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
  const { theme } = useContext(ThemeContext);

  const iconColor = active
    ? theme.font.color.primary
    : disabled
      ? theme.font.color.extraLight
      : theme.font.color.secondary;

  return (
    <StyledTabHover contentSize={contentSize} className={className}>
      {LeftIcon && (
        <LeftIcon color={iconColor} size={theme.icon.size.md} aria-hidden />
      )}
      {logo && <Avatar avatarUrl={logo} size="md" placeholder={title} />}
      {title}
      {RightIcon && (
        <RightIcon color={iconColor} size={theme.icon.size.md} aria-hidden />
      )}
      {pill && (typeof pill === 'string' ? <Pill label={pill} /> : pill)}
    </StyledTabHover>
  );
};
