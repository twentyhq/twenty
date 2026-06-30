import { type ReactNode } from 'react';
import { clsx } from 'clsx';

import { OverflowingTextWithTooltip } from '@ui/surfaces/OverflowingTextWithTooltip/OverflowingTextWithTooltip';

import styles from './H3Title.module.scss';

type H3TitleProps = {
  title: ReactNode;
  description?: string;
  className?: string;
};

export const H3Title = ({ title, description, className }: H3TitleProps) => {
  return (
    <div className={clsx(styles.container, className)}>
      <h3 className={styles.title}>{title}</h3>
      {description && (
        // Design rule: Never set a description for H3 if there are any H2 in the page
        // (in that case, each H2 must have its own description)
        <h4 className={styles.description}>
          <OverflowingTextWithTooltip
            text={description}
            displayedMaxRows={2}
            isTooltipMultiline={true}
          />
        </h4>
      )}
    </div>
  );
};
