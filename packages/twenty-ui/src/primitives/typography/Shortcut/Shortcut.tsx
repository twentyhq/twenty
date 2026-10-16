import { isNonEmptyArray } from '@sniptt/guards';
import { clsx } from 'clsx';
import { Fragment } from 'react';

import { useIsMobile } from '@ui/utilities/responsive/hooks/useIsMobile';

import { getShortcutPresentation } from './internal/getShortcutPresentation';
import styles from './Shortcut.module.scss';
import { type ShortcutProps } from './types/ShortcutProps';

export const Shortcut = ({
  shortcut,
  platform,
  sequenceJoinLabel,
  combinationSeparator,
  accessibleKeyLabels,
  variant = 'keys',
  visibility = 'always',
  className,
  'aria-label': ariaLabel,
  ...props
}: ShortcutProps) => {
  const isMobile = useIsMobile();
  const presentation = getShortcutPresentation({
    shortcut,
    platform,
    sequenceJoinLabel,
    combinationSeparator,
    accessibleKeyLabels,
  });

  if (
    !isNonEmptyArray(presentation.groups) ||
    (visibility === 'desktop' && isMobile)
  ) {
    return null;
  }

  return (
    <span
      {...props}
      className={clsx(styles.root, className)}
      data-variant={variant}
      role="img"
      aria-label={ariaLabel ?? presentation.accessibleLabel}
    >
      <span className={styles.content} aria-hidden>
        {variant !== 'keys'
          ? presentation.text
          : presentation.groups.map((keys, stepIndex) => (
              <Fragment key={stepIndex}>
                {stepIndex > 0 && (
                  <span>{` ${presentation.sequenceJoinLabel} `}</span>
                )}
                <span className={styles.combination}>
                  {keys.map((key, keyIndex) => (
                    <Fragment key={keyIndex}>
                      {keyIndex > 0 && presentation.separator}
                      <kbd className={styles.key}>{key}</kbd>
                    </Fragment>
                  ))}
                </span>
              </Fragment>
            ))}
      </span>
    </span>
  );
};
