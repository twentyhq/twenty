import React from 'react';

import { clsx } from 'clsx';

import { IconCheck } from '@ui/icon/components/TablerIcons';
import { useTheme } from '@ui/theme-constants';

import styles from './Checkmark.module.scss';

export type CheckmarkProps = React.ComponentPropsWithoutRef<'div'> & {
  className?: string;
};

export const Checkmark = ({ className }: CheckmarkProps) => {
  const theme = useTheme();

  return (
    <div className={clsx(styles.root, className)}>
      <IconCheck color={theme.grayScale.gray1} size={14} />
    </div>
  );
};
