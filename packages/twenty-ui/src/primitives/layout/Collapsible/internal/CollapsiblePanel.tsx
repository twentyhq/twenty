import { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible';
import { clsx } from 'clsx';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Collapsible.module.scss';
import { type CollapsiblePanelProps } from '../types/CollapsiblePanelProps';

export const CollapsiblePanel = ({
  dimension = 'height',
  containAnimation = true,
  duration = 'normal',
  className,
  ...props
}: CollapsiblePanelProps) => (
  <CollapsiblePrimitive.Panel
    data-dimension={dimension}
    data-duration={duration}
    {...props}
    className={mergeClassNames(
      clsx(styles.panel, containAnimation && styles.contained),
      className,
    )}
  />
);
