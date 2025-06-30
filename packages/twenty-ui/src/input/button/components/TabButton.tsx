import isPropValid from '@emotion/is-prop-valid';
import styled from '@emotion/styled';
import { Pill } from '@ui/components/Pill/Pill';
import { Avatar, IconComponent } from '@ui/display';
import { ThemeContext } from '@ui/theme';
import { ReactElement, useContext } from 'react';
import { Link } from 'react-router-dom';

const StyledTabButton = styled('button', {
  shouldForwardProp: (prop) => isPropValid(prop) && prop !== 'active',
})<{
  active?: boolean;
  disabled?: boolean;
  to?: string;
}>`
  all: unset;
  align-items: center;
  color: ${({ theme, active, disabled }) =>
    active
      ? theme.font.color.primary
      : disabled
        ? theme.font.color.light
        : theme.font.color.secondary};
  cursor: pointer;
  background-color: transparent;
  border: none;
  font-family: inherit;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
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
    background-color: ${({ theme, active }) =>
      active ? theme.border.color.inverted : 'transparent'};
    z-index: 1;
  }
`;

const StyledTabHover = styled.span<{
  contentSize?: 'sm' | 'md';
}>`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme, contentSize }) =>
    contentSize === 'sm'
      ? `${theme.spacing(1)} ${theme.spacing(2)}`
      : `${theme.spacing(2)} ${theme.spacing(2)}`};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  width: 100%;
  white-space: nowrap;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
  &:active {
    background: ${({ theme }) => theme.background.quaternary};
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
