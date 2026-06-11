import { clsx } from 'clsx';
import { type ComponentPropsWithoutRef } from 'react';

import styles from './ErrorPlaceholderStyled.module.scss';

export const AnimatedPlaceholderErrorContainer = ({
  className,
  ...rest
}: ComponentPropsWithoutRef<'div'>) => (
  <div
    className={clsx(styles.errorContainer, className)}
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...rest}
  />
);

export const AnimatedPlaceholderErrorTextContainer = ({
  className,
  ...rest
}: ComponentPropsWithoutRef<'div'>) => (
  <div
    className={clsx(styles.errorTextContainer, className)}
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...rest}
  />
);

export const AnimatedPlaceholderErrorTitle = ({
  className,
  ...rest
}: ComponentPropsWithoutRef<'div'>) => (
  <div
    className={clsx(styles.errorTitle, className)}
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...rest}
  />
);

export const AnimatedPlaceholderErrorSubTitle = ({
  className,
  ...rest
}: ComponentPropsWithoutRef<'div'>) => (
  <div
    className={clsx(styles.errorSubTitle, className)}
    // oxlint-disable-next-line react/jsx-props-no-spreading
    {...rest}
  />
);
