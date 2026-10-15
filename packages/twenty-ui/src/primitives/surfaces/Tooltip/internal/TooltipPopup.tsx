import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
import { isFunction, isNumber } from '@sniptt/guards';
import { type CSSProperties } from 'react';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../Tooltip.module.scss';
import { type TooltipPopupProps } from '../types/TooltipPopupProps';

export const TooltipPopup = ({
  className,
  withExitAnimation = false,
  maxWidth,
  style,
  ...props
}: TooltipPopupProps) => (
  <TooltipPrimitive.Popup
    role="tooltip"
    data-with-exit-animation={withExitAnimation || undefined}
    {...props}
    className={mergeClassNames(styles.popup, className)}
    style={(state) =>
      ({
        ...(isDefined(maxWidth)
          ? {
              '--tw-tooltip-max-width': isNumber(maxWidth)
                ? `${maxWidth}px`
                : maxWidth,
            }
          : {}),
        ...(isFunction(style) ? style(state) : style),
      }) as CSSProperties
    }
  />
);
