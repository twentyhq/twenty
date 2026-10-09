import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Tooltip.module.scss';
import { type TooltipArrowProps } from '../types/TooltipArrowProps';

export const TooltipArrow = ({ className, ...props }: TooltipArrowProps) => (
  <TooltipPrimitive.Arrow
    {...props}
    className={mergeClassNames(styles.arrow, className)}
  />
);
