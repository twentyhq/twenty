import { clsx } from 'clsx';
import { type CSSProperties } from 'react';
import { type AvatarGroupProps } from './types/AvatarGroupProps';

import styles from './AvatarGroup.module.scss';

const MAX_AVATARS_NB = 4;

export const AvatarGroup = ({
  avatars,
  className,
  maxVisible = MAX_AVATARS_NB,
  overflowAvatar,
  overflowCount = 0,
  overflowShape = 'square',
  overlap = 'right',
  overlapOffset = '3px',
}: AvatarGroupProps) => {
  const visibleAvatars = avatars.slice(0, maxVisible);
  const hasOverflowCount = !overflowAvatar && overflowCount > 0;

  if (!visibleAvatars.length && !overflowAvatar && !hasOverflowCount) {
    return null;
  }

  const itemStyle = {
    '--avatar-group-overlap-offset': overlapOffset,
  } as CSSProperties;

  return (
    <div className={clsx(styles.container, className)}>
      {visibleAvatars.map((avatar, index) => (
        <div
          className={styles.itemContainer}
          data-overlap={overlap}
          key={index}
          style={itemStyle}
        >
          {avatar}
        </div>
      ))}
      {overflowAvatar && (
        <div
          className={styles.itemContainer}
          data-overlap={overlap}
          style={itemStyle}
        >
          {overflowAvatar}
        </div>
      )}
      {hasOverflowCount && (
        <div
          className={clsx(styles.itemContainer, styles.overflowCountContainer)}
          data-overlap={overlap}
          style={itemStyle}
        >
          <div className={styles.overflowCount} data-shape={overflowShape}>
            +{overflowCount}
          </div>
        </div>
      )}
    </div>
  );
};
