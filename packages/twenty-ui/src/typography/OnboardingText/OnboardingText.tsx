import { clsx } from 'clsx';
import { type ComponentPropsWithoutRef } from 'react';
import styles from './OnboardingText.module.scss';

export const OnboardingTitle = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'h1'>) => (
  <h1 className={clsx(styles.title, className)} {...props} />
);

export const OnboardingSubtitle = ({
  className,
  ...props
}: ComponentPropsWithoutRef<'p'>) => (
  <p className={clsx(styles.subtitle, className)} {...props} />
);
