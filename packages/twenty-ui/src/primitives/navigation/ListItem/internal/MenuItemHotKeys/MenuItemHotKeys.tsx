import React from 'react';

import styles from './MenuItemHotKeys.module.scss';

export type MenuItemHotKeysProps = {
  hotKeys?: string[];
  joinLabel?: string;
};

export const MenuItemHotKeys = ({
  hotKeys,
  joinLabel = 'then',
}: MenuItemHotKeysProps) => {
  return (
    <div className={styles.commandText}>
      {hotKeys && (
        <div className={styles.commandTextContainer}>
          {hotKeys.map((hotKey, index) => (
            <React.Fragment key={index}>
              <div className={styles.commandKey}>{hotKey}</div>
              {index < hotKeys.length - 1 && joinLabel}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
