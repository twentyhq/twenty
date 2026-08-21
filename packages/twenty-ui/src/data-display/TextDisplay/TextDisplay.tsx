import { isUndefined } from '@sniptt/guards';
import { clsx } from 'clsx';

import { OverflowingTextWithTooltip } from '@ui/surfaces/OverflowingTextWithTooltip/OverflowingTextWithTooltip';

import styles from './TextDisplay.module.scss';

type TextDisplayProps = {
  text: string;
  displayedMaxRows?: number;
};

export const TextDisplay = ({ text, displayedMaxRows }: TextDisplayProps) => {
  const fixHeight = isUndefined(displayedMaxRows) || displayedMaxRows === 1;

  return (
    <div className={clsx(styles.container, fixHeight && styles.fixHeight)}>
      <OverflowingTextWithTooltip
        text={text}
        displayedMaxRows={displayedMaxRows}
        isTooltipMultiline={true}
      />
    </div>
  );
};
