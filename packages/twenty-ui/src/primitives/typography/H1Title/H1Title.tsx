import { type ReactNode } from 'react';
import { clsx } from 'clsx';

import styles from './H1Title.module.scss';

type H1TitleProps = {
  title: ReactNode;
  fontColor?: H1TitleFontColor;
  className?: string;
};

export enum H1TitleFontColor {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
}

const fontColorClassNames: Record<H1TitleFontColor, string> = {
  [H1TitleFontColor.Primary]: styles.primary,
  [H1TitleFontColor.Secondary]: styles.secondary,
  [H1TitleFontColor.Tertiary]: styles.tertiary,
};

export const H1Title = ({
  title,
  fontColor = H1TitleFontColor.Tertiary,
  className,
}: H1TitleProps) => {
  return (
    <h2
      className={clsx(styles.title, fontColorClassNames[fontColor], className)}
    >
      {title}
    </h2>
  );
};
