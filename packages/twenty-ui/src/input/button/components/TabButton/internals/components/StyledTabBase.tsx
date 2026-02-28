import { styled } from '@linaria/react';
import { ThemeContext, type ThemeType } from '@ui/theme';
import { forwardRef, useContext } from 'react';

const useThemeFromContext = () => {
  const { theme } = useContext(ThemeContext);
  return theme;
};

const StyledTabButtonInner = styled.button<{
  theme: ThemeType;
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

export const StyledTabButton = forwardRef<
  HTMLButtonElement,
  {
    theme?: ThemeType;
    active?: boolean;
    disabled?: boolean;
    to?: string;
    as?: React.ElementType;
  } & React.ComponentPropsWithoutRef<'button'>
>((props, ref) => {
  const contextTheme = useThemeFromContext();
  return (
    <StyledTabButtonInner
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      theme={props.theme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledTabButton.displayName = 'StyledTabButton';

const StyledTabContainerInner = styled.div<{
  theme: ThemeType;
  active?: boolean;
  disabled?: boolean;
}>`
  align-items: center;
  color: ${({ theme, active, disabled }) =>
    active
      ? theme.font.color.primary
      : disabled
        ? theme.font.color.light
        : theme.font.color.secondary};
  cursor: pointer;
  background-color: transparent;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  justify-content: center;
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

export const StyledTabContainer = forwardRef<
  HTMLDivElement,
  {
    theme?: ThemeType;
    active?: boolean;
    disabled?: boolean;
  } & React.ComponentPropsWithoutRef<'div'>
>((props, ref) => {
  const contextTheme = useThemeFromContext();
  return (
    <StyledTabContainerInner
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      theme={props.theme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledTabContainer.displayName = 'StyledTabContainer';

const StyledTabHoverInner = styled.span<{
  theme: ThemeType;
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

export const StyledTabHover = forwardRef<
  HTMLSpanElement,
  {
    theme?: ThemeType;
    contentSize?: 'sm' | 'md';
  } & React.ComponentPropsWithoutRef<'span'>
>((props, ref) => {
  const contextTheme = useThemeFromContext();
  return (
    <StyledTabHoverInner
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      theme={props.theme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledTabHover.displayName = 'StyledTabHover';
