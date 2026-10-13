import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Tooltip.module.scss';
import { type TooltipPopupProps } from '../types/TooltipPopupProps';

export const TooltipPopup = ({
  className,
  withExitAnimation = false,
  ...props
}: TooltipPopupProps) => (
  <TooltipPrimitive.Popup
    role="tooltip"
    data-with-exit-animation={withExitAnimation || undefined}
    {...props}
    className={mergeClassNames(styles.popup, className)}
  />
);
