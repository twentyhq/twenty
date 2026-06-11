import React, { useContext } from 'react';

import { clsx } from 'clsx';

import { IconCheck } from '@ui/display/icon/components/TablerIcons';
import { ThemeContext } from '@ui/theme-constants';

import styles from './Checkmark.module.scss';

export type CheckmarkProps = React.ComponentPropsWithoutRef<'div'> & {
  className?: string;
};

export const Checkmark = ({ className }: CheckmarkProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={clsx(styles.root, className)}>
      <IconCheck color={theme.grayScale.gray1} size={14} />
    </div>
  );
};
