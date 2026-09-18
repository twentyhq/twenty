import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { isNumber, isString } from '@sniptt/guards';

import { useThemeContainer } from '@ui/theme-constants';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Tooltip.module.scss';
import { type TooltipPopupProps } from '../types/TooltipPopupProps';
import { TooltipContent } from './TooltipContent';

const DEFAULT_SIDE_OFFSET = 10;
const DEFAULT_MAX_WIDTH = '300px';

export const TooltipPopup = ({
  side = 'top',
  align = 'center',
  sideOffset = DEFAULT_SIDE_OFFSET,
  alignOffset,
  anchor,
  positionMethod,
  collisionBoundary,
  collisionPadding,
  collisionAvoidance,
  sticky,
  disableAnchorTracking,
  arrow = false,
  maxWidth = DEFAULT_MAX_WIDTH,
  container,
  keepMounted,
  className,
  children,
  ...props
}: TooltipPopupProps) => {
  const themeContainer = useThemeContainer();
  const hasPlainTextContent = isString(children) || isNumber(children);

  return (
    <TooltipPrimitive.Portal
      container={container ?? themeContainer ?? undefined}
      keepMounted={keepMounted}
    >
      <TooltipPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        anchor={anchor}
        positionMethod={positionMethod}
        collisionBoundary={collisionBoundary}
        collisionPadding={collisionPadding}
        collisionAvoidance={collisionAvoidance}
        sticky={sticky}
        disableAnchorTracking={disableAnchorTracking}
        className={styles.positioner}
        style={{ maxWidth }}
      >
        <TooltipPrimitive.Popup
          role="tooltip"
          {...props}
          className={mergeClassNames(styles.popup, className)}
        >
          {hasPlainTextContent ? (
            <TooltipContent>{children}</TooltipContent>
          ) : (
            children
          )}
          {arrow && <TooltipPrimitive.Arrow className={styles.arrow} />}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
};
