import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';

import { mergeFieldPartClassName } from '@ui/input/Field/internal/mergeFieldPartClassName';

import styles from '../Tabs.module.scss';
import { type TabsTabProps } from '../types/TabsTabProps';
import { isRenderableSlot } from './isRenderableSlot';

export const TabsTab = ({
  className,
  children,
  startIcon,
  badge,
  size = 'sm',
  ...props
}: TabsTabProps) => (
  <TabsPrimitive.Tab
    {...props}
    className={mergeFieldPartClassName(styles.tab, className)}
    data-size={size}
  >
    <span className={styles.content}>
      {isRenderableSlot(startIcon) && (
        <span className={styles.startIcon} aria-hidden>
          {startIcon}
        </span>
      )}
      <span className={styles.label}>{children}</span>
      {isRenderableSlot(badge) && <span className={styles.badge}>{badge}</span>}
    </span>
  </TabsPrimitive.Tab>
);
