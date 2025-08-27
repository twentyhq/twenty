import { styled } from '@linaria/react';
import { Pill } from '@ui/components/Pill/Pill';
import { Avatar, type IconComponent } from '@ui/display';
import { ThemeContext } from '@ui/theme';
import { type ReactElement, useContext } from 'react';
import { Link } from 'react-router-dom';

const StyledTabButton = styled('button')<{
  active?: boolean;
  disabled?: boolean;
  to?: string;
}>`
  all: unset;
  align-items: center;
  color: ${({ active, disabled }) =>
    active
      ? 'var(--font-color-primary)'
      : disabled
        ? 'var(--font-color-light)'
        : 'var(--font-color-secondary)'};
  cursor: pointer;
  background-color: transparent;
  border: none;
  font-family: inherit;
  display: flex;
  gap: var(--spacing-1);
  justify-content: center;
  pointer-events: ${({ disabled }) => (disabled ? 'none' : '')};
  text-decoration: none;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background-color: ${({ active }) =>
      active ? 'var(--border-color-inverted)' : 'transparent'};
    z-index: 1;
  }
`;

const StyledTabHover = styled.span<{
  contentSize?: 'sm' | 'md';
}>`
  display: flex;
  gap: var(--spacing-1);
  padding: ${({ contentSize }) =>
    contentSize === 'sm'
      ? `var(--spacing-1) var(--spacing-2)`
      : `var(--spacing-2) var(--spacing-2)`};
  font-weight: var(--font-weight-medium);
  width: 100%;
  white-space: nowrap;
  border-radius: var(--border-radius-sm);
  &:hover {
    background: var(--background-tertiary);
  }
  &:active {
    background: var(--background-quaternary);
  }
`;

type TabButtonProps = {
  id: string;
  active?: boolean;
  disabled?: boolean;
  to?: string;
  LeftIcon?: IconComponent;
  className?: string;
  title?: string;
  onClick?: () => void;
  logo?: string;
  RightIcon?: IconComponent;
  pill?: string | ReactElement;
  contentSize?: 'sm' | 'md';
  disableTestId?: boolean;
};

export const TabButton = ({
  id,
  active,
  disabled,
  to,
  LeftIcon,
  className,
  title,
  onClick,
  logo,
  RightIcon,
  pill,
  contentSize = 'sm',
  disableTestId = false,
}: TabButtonProps) => {
  const { theme } = useContext(ThemeContext);
  const iconColor = active
    ? theme.font.color.primary
    : disabled
      ? theme.font.color.extraLight
      : theme.font.color.secondary;

  return (
    <StyledTabButton
      data-testid={disableTestId ? undefined : `tab-${id}`}
      active={active}
      disabled={disabled}
      as={to ? Link : 'button'}
      to={to}
      className={className}
      onClick={onClick}
    >
      <StyledTabHover contentSize={contentSize}>
        {LeftIcon && <LeftIcon color={iconColor} size={theme.icon.size.md} />}
        {logo && <Avatar avatarUrl={logo} size="md" placeholder={title} />}
        {title}
        {RightIcon && <RightIcon color={iconColor} size={theme.icon.size.md} />}
        {pill && (typeof pill === 'string' ? <Pill label={pill} /> : pill)}
      </StyledTabHover>
    </StyledTabButton>
  );
};
