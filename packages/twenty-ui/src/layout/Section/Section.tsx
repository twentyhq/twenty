import { clsx } from 'clsx';
import { type ReactNode } from 'react';

import styles from './Section.module.scss';

type SectionProps = {
  children: ReactNode;
  className?: string;
  alignment?: SectionAlignment;
  fullWidth?: boolean;
  fontColor?: SectionFontColor;
};

export enum SectionAlignment {
  Left = 'left',
  Center = 'center',
}

export enum SectionFontColor {
  Primary = 'primary',
  Secondary = 'secondary',
  Tertiary = 'tertiary',
}

export const Section = ({
  children,
  className,
  alignment = SectionAlignment.Left,
  fullWidth = true,
  fontColor = SectionFontColor.Primary,
}: SectionProps) => {
  return (
    <div
      className={clsx(
        styles.section,
        styles[alignment],
        styles[fontColor],
        fullWidth && styles.fullWidth,
        className,
      )}
    >
      {children}
    </div>
  );
};
