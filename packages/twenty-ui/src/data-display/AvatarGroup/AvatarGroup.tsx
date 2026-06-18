import { type ReactNode } from 'react';

import styles from './AvatarGroup.module.scss';

export type AvatarGroupProps = {
  avatars: ReactNode[];
};

const MAX_AVATARS_NB = 4;

export const AvatarGroup = ({ avatars }: AvatarGroupProps) => {
  if (!avatars.length) return null;

  return (
    <div className={styles.container}>
      {avatars.slice(0, MAX_AVATARS_NB).map((avatar, index) => (
        <div className={styles.itemContainer} key={index}>
          {avatar}
        </div>
      ))}
    </div>
  );
};
