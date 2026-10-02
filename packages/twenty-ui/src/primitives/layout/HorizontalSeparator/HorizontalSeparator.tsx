import { type JSX } from 'react';

import { Label } from '@ui/primitives/typography/internal/Label/Label';

import styles from './HorizontalSeparator.module.scss';

type HorizontalSeparatorProps = {
  visible?: boolean;
  text?: string;
  noMargin?: boolean;
  color?: string;
  textPosition?: 'center' | 'end';
};

export const HorizontalSeparator = ({
  visible = true,
  text = '',
  noMargin = false,
  color,
  textPosition = 'center',
}: HorizontalSeparatorProps): JSX.Element => {
  const colorStyle = color
    ? ({ '--horizontal-separator-color': color } as React.CSSProperties)
    : undefined;

  return (
    <>
      {text ? (
        <div
          className={styles.separatorContainer}
          role="separator"
          aria-label={text}
          data-no-margin={noMargin || undefined}
          data-colored={color ? true : undefined}
          style={colorStyle}
        >
          <div className={styles.line} data-visible={visible || undefined} />
          <Label>
            <span className={styles.text}>{text}</span>
          </Label>
          {textPosition === 'center' && (
            <div className={styles.line} data-visible={visible || undefined} />
          )}
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
