import { styled } from '@linaria/react';

import { isUndefined } from '@sniptt/guards';

import { IconCheck } from '@ui/display';
import {
  HOVER_BACKGROUND,
  ThemeContext,
  type ThemeType,
} from '@ui/theme';
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

const RawStyledMenuItemBase = styled.div<
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

  ${({ theme, isKeySelected }) =>
    isKeySelected ? `background: ${theme.background.transparent.light};` : ''}

  ${({ isHoverBackgroundDisabled, disabled, theme }) =>
    disabled || isHoverBackgroundDisabled ? '' : HOVER_BACKGROUND({ theme })};

  ${({ theme, accent, disabled }) => {
    if (!isUndefined(disabled) && disabled !== false) {
      return `
        color: ${theme.font.color.tertiary};
      `;
    }

    switch (accent) {
      case 'danger': {
        return `
          color: ${theme.font.color.danger};
          &:hover {
            background: ${theme.background.transparent.danger};
          }
        `;
      }
      case 'placeholder': {
        return `
          color: ${theme.font.color.tertiary};
        `;
      }
      case 'default':
      default: {
        return `
          color: ${theme.font.color.secondary};
        `;
      }
    }
  }}

  ${({ focused, theme }) =>
    focused ? `background: ${theme.background.transparent.light};` : ''};

  position: relative;
  user-select: none;

  width: calc(100% - 2 * var(--horizontal-padding));
`;

function useThemeFromContext() {
  const { theme } = useContext(ThemeContext);
  return theme;
}

export const StyledMenuItemBase = forwardRef<
  HTMLDivElement,
  MenuItemBaseProps &
    React.ComponentPropsWithoutRef<'div'>
>((props, ref) => {
  const contextTheme = useThemeFromContext();
  return (
    <RawStyledMenuItemBase
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
    <RawStyledMenuItemLabel
      {...props}
      theme={props.theme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledMenuItemLabel.displayName = 'StyledMenuItemLabel';

const RawStyledMenuItemLabel = styled.div<{ theme: ThemeType }>`
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
    <RawStyledMenuItemLabelLight
      {...props}
      theme={props.theme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledMenuItemLabelLight.displayName = 'StyledMenuItemLabelLight';

const RawStyledMenuItemLabelLight = styled(RawStyledMenuItemLabel)`
  color: ${({ theme }) => theme.font.color.light};
`;

export const StyledNoIconFiller = forwardRef<
  HTMLDivElement,
  { theme?: ThemeType } & React.ComponentPropsWithoutRef<'div'>
>((props, ref) => {
  const contextTheme = useThemeFromContext();
  return (
    <RawStyledNoIconFiller
      {...props}
      theme={props.theme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledNoIconFiller.displayName = 'StyledNoIconFiller';

const RawStyledNoIconFiller = styled.div<{ theme: ThemeType }>`
  width: ${({ theme }) => theme.spacing(1)};
`;

export const StyledMenuItemLeftContent = forwardRef<
  HTMLDivElement,
  { theme?: ThemeType } & React.ComponentPropsWithoutRef<'div'>
>((props, ref) => {
  const contextTheme = useThemeFromContext();
  return (
    <RawStyledMenuItemLeftContent
      {...props}
      theme={props.theme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledMenuItemLeftContent.displayName = 'StyledMenuItemLeftContent';

const RawStyledMenuItemLeftContent = styled.div<{ theme: ThemeType }>`
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
    <RawStyledMenuItemRightContent
      {...props}
      theme={props.theme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledMenuItemRightContent.displayName = 'StyledMenuItemRightContent';

const RawStyledMenuItemRightContent = styled.div<{ theme: ThemeType }>`
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
    <RawStyledHoverableMenuItemBase
      {...props}
      theme={props.theme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledHoverableMenuItemBase.displayName = 'StyledHoverableMenuItemBase';

const RawStyledHoverableMenuItemBase = styled(RawStyledMenuItemBase)<{
  disabled?: boolean;
  isIconDisplayedOnHoverOnly?: boolean;
  cursor?: 'drag' | 'default';
  theme: ThemeType;
}>`
  ${({ isIconDisplayedOnHoverOnly, theme }) =>
    isIconDisplayedOnHoverOnly
      ? `
      & .hoverable-buttons {
        opacity: 0;
        right: ${theme.spacing(2)};
      }

      &:hover {
        & .hoverable-buttons {
          opacity: 1;
        }
      }
    `
      : ''};

  & .hoverable-buttons {
    transition: opacity ${({ theme }) => theme.animation.duration.instant}s ease;
  }

  &:hover {
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
    <RawStyledMenuItemIconCheck
      {...rest}
      theme={propTheme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledMenuItemIconCheck.displayName = 'StyledMenuItemIconCheck';

const RawStyledMenuItemIconCheck = styled(IconCheck)<{
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
    <RawStyledMenuItemContextualText
      {...props}
      theme={props.theme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledMenuItemContextualText.displayName = 'StyledMenuItemContextualText';

const RawStyledMenuItemContextualText = styled.div<{
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
    <RawStyledRightMenuItemContextualText
      {...props}
      theme={props.theme ?? contextTheme}
      ref={ref}
    />
  );
});
StyledRightMenuItemContextualText.displayName =
  'StyledRightMenuItemContextualText';

const RawStyledRightMenuItemContextualText = styled(
  RawStyledMenuItemContextualText,
)`
  text-align: right;
`;
