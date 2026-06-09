import { isNavigationModifierPressed } from '@ui/utilities/navigation/isNavigationModifierPressed';
import { type TriggerEventType } from '@ui/utilities/navigation/types/trigger-event.type';
import { type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

type UseMouseDownNavigationProps = {
  to?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  onBeforeNavigation?: () => void;
  triggerEvent?: TriggerEventType;
  stopPropagation?: boolean;
};

export const useMouseDownNavigation = ({
  to,
  onClick,
  disabled = false,
  onBeforeNavigation,
  triggerEvent = 'MOUSE_DOWN',
}: UseMouseDownNavigationProps) => {
  const navigate = useNavigate();

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (disabled) return;

    // For modifier keys, let the default browser behavior handle it
    if (isNavigationModifierPressed(event)) {
      onBeforeNavigation?.();
      if (isDefined(onClick) && !isDefined(to)) {
        onClick(event);
      }
      // Don't prevent default for modifier keys to allow browser navigation
      return;
    }

    if (triggerEvent === 'CLICK') {
      onBeforeNavigation?.();
      if (isDefined(onClick)) {
        onClick(event);
      } else if (isDefined(to)) {
        navigate(to);
      }
    }

    // For regular clicks, prevent default to avoid double navigation
    event.preventDefault();
  };

  const handleMouseDown = (event: MouseEvent<HTMLElement>) => {
    if (disabled || triggerEvent === 'CLICK') return;

    if (isNavigationModifierPressed(event)) {
      return;
    }

    onBeforeNavigation?.();

    if (isDefined(onClick)) {
      onClick(event);
    } else if (isDefined(to)) {
      navigate(to);
    }
  };

  return {
    onClick: handleClick,
    onMouseDown: handleMouseDown,
  };
};
