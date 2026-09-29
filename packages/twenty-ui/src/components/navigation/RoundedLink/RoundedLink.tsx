import { isNonEmptyString } from '@sniptt/guards';
import { clsx } from 'clsx';
import { type MouseEvent } from 'react';

import { getSafeUrl } from '@ui/utilities/utils/getSafeUrl';

import styles from './RoundedLink.module.scss';

type RoundedLinkProps = {
  href: string;
  label?: string;
  color?: 'primary' | 'secondary';
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  className?: string;
};

export const RoundedLink = ({
  label,
  href,
  color = 'primary',
  onClick,
  className,
}: RoundedLinkProps) => {
  if (!isNonEmptyString(label)) {
    return <></>;
  }

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    onClick?.(event);
  };

  return (
    <a
      href={getSafeUrl(href)}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      data-color={color}
      className={clsx(styles.root, className)}
    >
      {label}
    </a>
  );
};
