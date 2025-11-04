import { Pill } from '@ui/components/Pill/Pill';
import { Avatar, type IconComponent } from '@ui/display';
import { ThemeContext } from '@ui/theme';
import { type ReactElement, useContext } from 'react';
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
  const { theme } = useContext(ThemeContext);
  const iconColor = active
    ? theme.font.color.primary
    : disabled
      ? theme.font.color.extraLight
      : theme.font.color.secondary;

  return (
    <StyledTabHover contentSize={contentSize} className={className}>
      {LeftIcon && <LeftIcon color={iconColor} size={theme.icon.size.md} />}
      {logo && <Avatar avatarUrl={logo} size="md" placeholder={title} />}
      {title}
      {RightIcon && <RightIcon color={iconColor} size={theme.icon.size.md} />}
      {pill && (typeof pill === 'string' ? <Pill label={pill} /> : pill)}
    </StyledTabHover>
  );
};
