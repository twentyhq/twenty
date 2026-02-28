import { styled } from '@linaria/react';

import { isUndefined } from '@sniptt/guards';

import { IconCheck } from '@ui/display';
import { ThemeContext, type ThemeType } from '@ui/theme';
import { forwardRef, useContext } from 'react';
import { type MenuItemAccent } from '../../types/MenuItemAccent';

export type MenuItemBaseProps = {
  accent?: MenuItemAccent;
  isKeySelected?: boolean;
  isHoverBackgroundDisabled?: boolean;
  hovered?: boolean;
  disabled?: boolean;
  focused?: boolean;
  theme?: ThemeType;
};

const StyledMenuItemBaseInner = styled.div<
  MenuItemBaseProps & { theme: ThemeType }
>`
  --horizontal-padding: ${({ theme }) => theme.spacing(1)};
  --vertical-padding: ${({ theme }) => theme.spacing(2)};
  align-items: center;

  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;

  display: flex;

  flex-direction: row;

  font-size: ${({ theme }) => theme.font.size.sm};

  gap: ${({ theme }) => theme.spacing(2)};

  height: calc(32px - 2 * var(--vertical-padding));
  justify-content: space-between;

  padding: var(--vertical-padding) var(--horizontal-padding);

  background: ${({ theme, isKeySelected, focused }) =>
    isKeySelected || focused ? theme.background.transparent.light : ''};

  transition: ${({ isHoverBackgroundDisabled, disabled }) =>
    disabled || isHoverBackgroundDisabled ? 'none' : 'background 0.1s ease'};

  color: ${({ theme, accent, disabled }) => {
    if (!isUndefined(disabled) && disabled !== false) {
      return theme.font.color.tertiary;
    }
    switch (accent) {
      case 'danger':
        return theme.font.color.danger;
      case 'placeholder':
        return theme.font.color.tertiary;
      case 'default':
      default:
        return theme.font.color.secondary;
    }
  }};

  &:hover {
    background: ${({ theme, accent, disabled, isHoverBackgroundDisabled }) => {
      if (disabled === true || isHoverBackgroundDisabled === true)
        return 'transparent';
      if (accent === 'danger') return theme.background.transparent.danger;
      return theme.background.transparent.light;
    }};
  }

  position: relative;
  user-select: none;

  width: calc(100% - 2 * var(--horizontal-padding));
`;

const useThemeFromContext = () => {
  const { theme } = useContext(ThemeContext);
  return theme;
};

export const StyledMenuItemBase = forwardRef<
  HTMLDivElement,
  MenuItemBaseProps & React.ComponentPropsWithoutRef<'div'>
>((props, ref) => {
  const contextTheme = useThemeFromContext();
  return (
    <StyledMenuItemBaseInner
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      theme={props.theme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledMenuItemBase.displayName = 'StyledMenuItemBase';

export const StyledMenuItemLabel = forwardRef<
  HTMLDivElement,
  { theme?: ThemeType } & React.ComponentPropsWithoutRef<'div'>
>((props, ref) => {
  const contextTheme = useThemeFromContext();
  return (
    <StyledMenuItemLabelInner
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      theme={props.theme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledMenuItemLabel.displayName = 'StyledMenuItemLabel';

const StyledMenuItemLabelInner = styled.div<{ theme: ThemeType }>`
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};

  overflow: hidden;

  white-space: nowrap;
`;

export const StyledMenuItemLabelLight = forwardRef<
  HTMLDivElement,
  { theme?: ThemeType } & React.ComponentPropsWithoutRef<'div'>
>((props, ref) => {
  const contextTheme = useThemeFromContext();
  return (
    <StyledMenuItemLabelLightInner
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      theme={props.theme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledMenuItemLabelLight.displayName = 'StyledMenuItemLabelLight';

const StyledMenuItemLabelLightInner = styled(StyledMenuItemLabelInner)`
  color: ${({ theme }) => theme.font.color.light};
`;

export const StyledNoIconFiller = forwardRef<
  HTMLDivElement,
  { theme?: ThemeType } & React.ComponentPropsWithoutRef<'div'>
>((props, ref) => {
  const contextTheme = useThemeFromContext();
  return (
    <StyledNoIconFillerInner
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      theme={props.theme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledNoIconFiller.displayName = 'StyledNoIconFiller';

const StyledNoIconFillerInner = styled.div<{ theme: ThemeType }>`
  width: ${({ theme }) => theme.spacing(1)};
`;

export const StyledMenuItemLeftContent = forwardRef<
  HTMLDivElement,
  { theme?: ThemeType } & React.ComponentPropsWithoutRef<'div'>
>((props, ref) => {
  const contextTheme = useThemeFromContext();
  return (
    <StyledMenuItemLeftContentInner
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      theme={props.theme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledMenuItemLeftContent.displayName = 'StyledMenuItemLeftContent';

const StyledMenuItemLeftContentInner = styled.div<{ theme: ThemeType }>`
  align-items: center;
  display: flex;

  flex-direction: row;

  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
  width: 100%;

  & svg {
    flex-shrink: 0;
  }
`;

export const StyledMenuItemRightContent = forwardRef<
  HTMLDivElement,
  { theme?: ThemeType } & React.ComponentPropsWithoutRef<'div'>
>((props, ref) => {
  const contextTheme = useThemeFromContext();
  return (
    <StyledMenuItemRightContentInner
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      theme={props.theme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledMenuItemRightContent.displayName = 'StyledMenuItemRightContent';

const StyledMenuItemRightContentInner = styled.div<{ theme: ThemeType }>`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(2)};

  & svg {
    flex-shrink: 0;
  }
`;

export const StyledDraggableItem = styled.div`
  cursor: grab;

  align-items: center;
  display: flex;
`;

type HoverableMenuItemBaseProps = {
  isIconDisplayedOnHoverOnly?: boolean;
  cursor?: 'drag' | 'default';
} & MenuItemBaseProps &
  React.ComponentPropsWithoutRef<'div'>;

export const StyledHoverableMenuItemBase = forwardRef<
  HTMLDivElement,
  HoverableMenuItemBaseProps
>((props, ref) => {
  const contextTheme = useThemeFromContext();
  return (
    <StyledHoverableMenuItemBaseInner
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      theme={props.theme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledHoverableMenuItemBase.displayName = 'StyledHoverableMenuItemBase';

const StyledHoverableMenuItemBaseInner = styled(StyledMenuItemBaseInner)<{
  disabled?: boolean;
  isIconDisplayedOnHoverOnly?: boolean;
  cursor?: 'drag' | 'default';
  theme: ThemeType;
}>`
  & .hoverable-buttons {
    opacity: ${({ isIconDisplayedOnHoverOnly }) =>
      isIconDisplayedOnHoverOnly === true ? '0' : '1'};
    right: ${({ isIconDisplayedOnHoverOnly, theme }) =>
      isIconDisplayedOnHoverOnly === true ? theme.spacing(2) : 'auto'};
    transition: opacity ${({ theme }) => theme.animation.duration.instant}s ease;
  }

  &:hover {
    & .hoverable-buttons {
      opacity: 1;
    }
    & .grip-swap-default-icon {
      opacity: 0;
    }
    & .grip-swap-hover-icon {
      opacity: 1;
    }
  }

  cursor: ${({ cursor, disabled }) => {
    if (!isUndefined(disabled) && disabled !== false) {
      return 'default';
    }

    switch (cursor) {
      case 'drag':
        return 'grab';
      default:
        return 'pointer';
    }
  }};
`;

export const StyledMenuItemIconCheck = forwardRef<
  any,
  { theme?: ThemeType; size?: number; className?: string }
>(({ theme: propTheme, ...rest }, ref) => {
  const contextTheme = useThemeFromContext();
  return (
    <StyledMenuItemIconCheckInner
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...rest}
      theme={propTheme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledMenuItemIconCheck.displayName = 'StyledMenuItemIconCheck';

const StyledMenuItemIconCheckInner = styled(IconCheck)<{
  theme: ThemeType;
}>`
  flex-shrink: 0;
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

export const StyledMenuItemContextualText = forwardRef<
  HTMLDivElement,
  { theme?: ThemeType } & React.ComponentPropsWithoutRef<'div'>
>((props, ref) => {
  const contextTheme = useThemeFromContext();
  return (
    <StyledMenuItemContextualTextInner
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      theme={props.theme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledMenuItemContextualText.displayName = 'StyledMenuItemContextualText';

const StyledMenuItemContextualTextInner = styled.div<{
  theme: ThemeType;
}>`
  color: ${({ theme }) => theme.font.color.light};
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  padding-left: ${({ theme }) => theme.spacing(1)};
  flex-shrink: 1;
  overflow: hidden;
`;

export const StyledRightMenuItemContextualText = forwardRef<
  HTMLDivElement,
  { theme?: ThemeType } & React.ComponentPropsWithoutRef<'div'>
>((props, ref) => {
  const contextTheme = useThemeFromContext();
  return (
    <StyledRightMenuItemContextualTextInner
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
      theme={props.theme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledRightMenuItemContextualText.displayName =
  'StyledRightMenuItemContextualText';

const StyledRightMenuItemContextualTextInner = styled(
  StyledMenuItemContextualTextInner,
)`
  text-align: right;
`;
