import { clsx } from 'clsx';

import { OverflowingTextWithTooltip } from '@ui/surfaces/OverflowingTextWithTooltip/OverflowingTextWithTooltip';

import styles from './H2Title.module.scss';

type H2TitleProps = {
  title: string;
  description?: string;
  adornment?: React.ReactNode;
  className?: string;
};

export const H2Title = ({
  title,
  description,
  adornment,
  className,
}: H2TitleProps) => {
  return (
    <div className={clsx(styles.container, className)}>
      <div className={styles.titleContainer}>
        <h2 className={styles.title}>{title}</h2>
        {adornment}
      </div>
      {description && (
        <h3 className={styles.description}>
          <OverflowingTextWithTooltip
            text={description}
            displayedMaxRows={5}
            isTooltipMultiline={true}
          />
        </h3>
      )}
    </div>
  );
};
