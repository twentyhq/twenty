import { clsx } from 'clsx';
import { type CSSProperties, type ReactNode } from 'react';

import styles from './AvatarGroup.module.scss';

export type AvatarGroupProps = {
  avatars: ReactNode[];
  className?: string;
  maxVisible?: number;
  overflowAvatar?: ReactNode;
  overlap?: 'left' | 'right';
  overlapOffset?: string;
};

const MAX_AVATARS_NB = 4;

export const AvatarGroup = ({
  avatars,
  className,
  maxVisible = MAX_AVATARS_NB,
  overflowAvatar,
  overlap = 'right',
  overlapOffset = '3px',
}: AvatarGroupProps) => {
  const visibleAvatars = avatars.slice(0, maxVisible);

  if (!visibleAvatars.length && !overflowAvatar) return null;

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
    </div>
  );
};
