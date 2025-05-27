import { executeClickAction } from '@ui/utilities/navigation/hooks/executeClickAction';
import { isNavigationModifierPressed } from '@ui/utilities/navigation/isNavigationModifierPressed';
import { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

type UseMouseDownNavigationProps = {
  to?: string;
  onClick?: (() => void) | ((event: MouseEvent<HTMLElement>) => void);
  disabled?: boolean;
  onBeforeNavigation?: () => void;
  triggerEvent?: 'MOUSE_DOWN' | 'CLICK';
  stopPropagation?: boolean;
};

export const useMouseDownNavigation = ({
  to,
  onClick,
  disabled = false,
  onBeforeNavigation,
  triggerEvent = 'MOUSE_DOWN',
  stopPropagation = false,
}: UseMouseDownNavigationProps) => {
  const navigate = useNavigate();

  const executeAction = (event: MouseEvent<HTMLElement>) => {
    if (stopPropagation) {
      event.stopPropagation();
    }

    onBeforeNavigation?.();

    if (isDefined(onClick)) {
      executeClickAction(event, onClick);
    } else if (isDefined(to)) {
      navigate(to);
    }
  };

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (disabled) return;

    if (stopPropagation) {
      event.stopPropagation();
    }

    // For modifier keys, let the default browser behavior handle it
    if (isNavigationModifierPressed(event)) {
      if (isDefined(onClick) && !isDefined(to)) {
        executeClickAction(event, onClick);
      }
      // Don't prevent default for modifier keys to allow browser navigation
      return;
    }

    // For CLICK trigger mode, execute action on click
    /*  if (triggerEvent === 'CLICK') {
      executeAction();
    } */

    // For regular clicks, prevent default to avoid double navigation
    event.preventDefault();
  };

  const handleMouseDown = (event: MouseEvent<HTMLElement>) => {
    if (disabled || triggerEvent === 'CLICK') return;

    if (stopPropagation) {
      event.stopPropagation();
    }

    // Only handle left mouse button without modifier keys for MOUSE_DOWN trigger
    if (!isNavigationModifierPressed(event)) {
      executeAction(event);
    }
  };

  return {
    onClick: handleClick,
    onMouseDown: handleMouseDown,
  };
};
