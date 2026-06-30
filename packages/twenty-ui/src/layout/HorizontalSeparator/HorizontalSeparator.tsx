import { type JSX } from 'react';

import { Label } from '@ui/typography';

import styles from './HorizontalSeparator.module.scss';

type HorizontalSeparatorProps = {
  visible?: boolean;
  text?: string;
  noMargin?: boolean;
  color?: string;
};

export const HorizontalSeparator = ({
  visible = true,
  text = '',
  noMargin = false,
  color,
}: HorizontalSeparatorProps): JSX.Element => {
  const colorStyle = color
    ? ({ '--horizontal-separator-color': color } as React.CSSProperties)
    : undefined;

  return (
    <>
      {text ? (
        <div
          className={styles.separatorContainer}
          data-no-margin={noMargin || undefined}
          style={colorStyle}
        >
          <div className={styles.line} data-visible={visible || undefined} />
          <Label>
            <span className={styles.text}>{text}</span>
          </Label>
          <div className={styles.line} data-visible={visible || undefined} />
        </div>
      ) : (
        <div
          className={styles.separator}
          data-visible={visible || undefined}
          data-no-margin={noMargin || undefined}
          style={colorStyle}
        />
      )}
    </>
  );
};
