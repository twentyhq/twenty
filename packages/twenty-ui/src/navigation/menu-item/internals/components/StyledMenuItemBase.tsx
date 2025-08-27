import { styled } from '@linaria/react';

import { isUndefined } from '@sniptt/guards';

import { css } from '@linaria/core';
import { IconCheck } from '@ui/display';
import { type MenuItemAccent } from '../../types/MenuItemAccent';

export type MenuItemBaseProps = {
  accent?: MenuItemAccent;
  isKeySelected?: boolean;
  isHoverBackgroundDisabled?: boolean;
  hovered?: boolean;
  disabled?: boolean;
  focused?: boolean;
};

// TODO Charles: check hover background
export const StyledMenuItemBase = styled.div<MenuItemBaseProps>`
  --horizontal-padding: var(--spacing-1);
  --vertical-padding: var(--spacing-2);
  align-items: center;

  border-radius: var(--border-radius-sm);
  cursor: pointer;

  display: flex;

  flex-direction: row;

  font-size: var(--font-size-sm);

  gap: var(--spacing-2);

  height: calc(32px - 2 * var(--vertical-padding));
  justify-content: space-between;

  padding: var(--vertical-padding) var(--horizontal-padding);

  ${({ isKeySelected }) =>
    isKeySelected ? `background: var(--background-transparent-light);` : ''}

  ${({ isHoverBackgroundDisabled, disabled }) =>
    disabled || isHoverBackgroundDisabled ? '' : 'var(--hover-background)'};

  ${({ accent, disabled }) => {
    if (!isUndefined(disabled) && disabled !== false) {
      return css`
        color: var(--font-color-tertiary);
      `;
    }

    switch (accent) {
      case 'danger': {
        return css`
          color: var(--font-color-danger);
          &:hover {
            background: var(--background-transparent-danger);
          }
        `;
      }
      case 'placeholder': {
        return css`
          color: var(--font-color-tertiary);
        `;
      }
      case 'default':
      default: {
        return css`
          color: var(--font-color-secondary);
        `;
      }
    }
  }}

  ${({ focused }) => {
    if (focused === true) {
      return css`
        background: var(--background-transparent-light);
      `;
    }

    return '';
  }};

  position: relative;
  user-select: none;

  width: calc(100% - 2 * var(--horizontal-padding));
`;

export const StyledMenuItemLabel = styled.div`
  display: flex;
  flex-direction: row;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-regular);

  overflow: hidden;

  white-space: nowrap;
`;

export const StyledNoIconFiller = styled.div`
  width: var(--spacing-1);
`;

export const StyledMenuItemLeftContent = styled.div`
  align-items: center;
  display: flex;

  flex-direction: row;

  gap: var(--spacing-2);
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
  cursor?: 'drag' | 'default';
}>`
  ${({ isIconDisplayedOnHoverOnly }) =>
    isIconDisplayedOnHoverOnly
      ? css`
          & .hoverable-buttons {
            opacity: 0;
            position: fixed;
            right: var(--spacing-2);
          }

          &:hover {
            & .hoverable-buttons {
              opacity: 1;
              position: static;
            }
          }
        `
      : css``}

  & .hoverable-buttons {
    transition: opacity var(--animation-duration-instant) ease;
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

export const StyledMenuItemIconCheck = styled(IconCheck)`
  flex-shrink: 0;
  margin-right: var(--spacing-1);
`;
