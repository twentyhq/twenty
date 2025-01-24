import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { isUndefined } from '@sniptt/guards';
import { HOVER_BACKGROUND } from '@ui/theme';
import { MenuItemAccent } from '../../types/MenuItemAccent';

export type MenuItemBaseProps = {
  accent?: MenuItemAccent;
  isKeySelected?: boolean;
  isHoverBackgroundDisabled?: boolean;
  hovered?: boolean;
  disabled?: boolean;
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

  ${({ isHoverBackgroundDisabled, disabled }) =>
    (disabled || isHoverBackgroundDisabled) ?? HOVER_BACKGROUND};

  ${({ theme, accent, disabled }) => {
    const isDisabled = !isUndefined(disabled) && disabled !== false;

    switch (accent) {
      case 'danger': {
        return css`
          color: ${theme.font.color.danger};
          &:hover {
            background: ${theme.background.transparent.danger};
          }
          ${isDisabled && `opacity: 0.4;`}
        `;
      }
      case 'placeholder': {
        return css`
          color: ${theme.font.color.tertiary};
          ${isDisabled && `opacity: 0.4;`}
        `;
      }
      case 'default':
      default: {
        return css`
          color: ${theme.font.color.secondary};
          ${isDisabled && `opacity: 0.4;`}
        `;
      }
    }
  }}

  position: relative;
  user-select: none;

  width: calc(100% - 2 * var(--horizontal-padding));
`;

export const StyledMenuItemLabel = styled.div`
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};

  overflow: hidden;

  white-space: nowrap;
`;

export const StyledNoIconFiller = styled.div`
  width: ${({ theme }) => theme.spacing(1)};
`;

export const StyledMenuItemLeftContent = styled.div`
  align-items: center;
  display: flex;

  flex-direction: row;

  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
  width: 100%;

  & > svg {
    flex-shrink: 0;
  }
`;

export const StyledMenuItemRightContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
`;

export const StyledDraggableItem = styled.div`
  cursor: grab;

  align-items: center;
  display: flex;
`;

export const StyledHoverableMenuItemBase = styled(StyledMenuItemBase)<{
  disabled?: boolean;
  isIconDisplayedOnHoverOnly?: boolean;
  cursor?: 'drag' | 'default' | 'not-allowed';
}>`
  ${({ isIconDisplayedOnHoverOnly, theme }) =>
    isIconDisplayedOnHoverOnly &&
    css`
      & .hoverable-buttons {
        opacity: 0;
        position: fixed;
        right: ${theme.spacing(2)};
      }

      &:hover {
        & .hoverable-buttons {
          opacity: 1;
          position: static;
        }
      }
    `};

  & .hoverable-buttons {
    transition: opacity ${({ theme }) => theme.animation.duration.instant}s ease;
  }

  cursor: ${({ cursor, disabled }) => {
    if (!isUndefined(disabled) && disabled !== false) {
      return 'not-allowed';
    }

    switch (cursor) {
      case 'drag':
        return 'grab';
      case 'not-allowed':
        return 'not-allowed';
      default:
        return 'pointer';
    }
  }};
`;
