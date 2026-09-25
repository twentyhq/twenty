import { isRenderableSlot } from '../../Tabs/internal/isRenderableSlot';
import { type TabsTabProps } from '../../Tabs/types/TabsTabProps';

import styles from './Tab.module.scss';

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
