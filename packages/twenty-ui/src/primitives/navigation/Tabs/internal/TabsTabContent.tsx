import { type TabsTabProps } from '../types/TabsTabProps';
import { isRenderableSlot } from './isRenderableSlot';

import styles from '../Tabs.module.scss';

type TabsTabContentProps = Pick<
  TabsTabProps,
  'children' | 'startIcon' | 'endIcon' | 'badge'
>;

export const TabsTabContent = ({
  children,
  startIcon,
  endIcon,
  badge,
}: TabsTabContentProps) => (
  <span className={styles.content}>
    {isRenderableSlot(startIcon) && (
      <span className={styles.startIcon} aria-hidden>
        {startIcon}
      </span>
    )}
    <span className={styles.label}>{children}</span>
    {isRenderableSlot(endIcon) && (
      <span className={styles.startIcon} aria-hidden>
        {endIcon}
      </span>
    )}
    {isRenderableSlot(badge) && <span className={styles.badge}>{badge}</span>}
  </span>
);
