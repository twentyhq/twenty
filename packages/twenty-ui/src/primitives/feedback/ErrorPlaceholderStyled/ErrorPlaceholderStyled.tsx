import { clsx } from 'clsx';
import { type ComponentPropsWithoutRef } from 'react';

import styles from './ErrorPlaceholderStyled.module.scss';

export const AnimatedPlaceholderErrorContainer = ({
  className,
  ...rest
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={clsx(styles.errorContainer, className)} {...rest} />
);

export const AnimatedPlaceholderErrorTextContainer = ({
  className,
  ...rest
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={clsx(styles.errorTextContainer, className)} {...rest} />
);

export const AnimatedPlaceholderErrorTitle = ({
  className,
  ...rest
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={clsx(styles.errorTitle, className)} {...rest} />
);

export const AnimatedPlaceholderErrorSubTitle = ({
  className,
  ...rest
}: ComponentPropsWithoutRef<'div'>) => (
  <div className={clsx(styles.errorSubTitle, className)} {...rest} />
);
