import { styled } from '@linaria/react';

import { isUndefined } from '@sniptt/guards';

import { IconCheck } from '@ui/display';
import { HOVER_BACKGROUND, type ThemeType } from '@ui/theme';
import { type MenuItemAccent } from '../../types/MenuItemAccent';

export type MenuItemBaseProps = {
  accent?: MenuItemAccent;
  isKeySelected?: boolean;
  isHoverBackgroundDisabled?: boolean;
  hovered?: boolean;
  disabled?: boolean;
  focused?: boolean;
  theme: ThemeType;
};

export const StyledMenuItemBase = styled.div<MenuItemBaseProps>`
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

export const StyledMenuItemLabel = styled.div<{ theme: ThemeType }>`
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};

  overflow: hidden;

  white-space: nowrap;
`;

export const StyledMenuItemLabelLight = styled(StyledMenuItemLabel)`
  color: ${({ theme }) => theme.font.color.light};
`;

export const StyledNoIconFiller = styled.div<{ theme: ThemeType }>`
  width: ${({ theme }) => theme.spacing(1)};
`;

export const StyledMenuItemLeftContent = styled.div<{ theme: ThemeType }>`
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

export const StyledMenuItemRightContent = styled.div<{ theme: ThemeType }>`
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

export const StyledHoverableMenuItemBase = styled(StyledMenuItemBase)<{
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

export const StyledMenuItemIconCheck = styled(IconCheck)<{ theme: ThemeType }>`
  flex-shrink: 0;
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

export const StyledMenuItemContextualText = styled.div<{ theme: ThemeType }>`
  color: ${({ theme }) => theme.font.color.light};
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  padding-left: ${({ theme }) => theme.spacing(1)};
  flex-shrink: 1;
  overflow: hidden;
`;

export const StyledRightMenuItemContextualText = styled(
  StyledMenuItemContextualText,
)`
  text-align: right;
`;
