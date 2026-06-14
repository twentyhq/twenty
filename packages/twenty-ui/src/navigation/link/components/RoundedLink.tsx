import { isNonEmptyString } from '@sniptt/guards';
import { clsx } from 'clsx';
import { type MouseEvent } from 'react';

import styles from './RoundedLink.module.scss';

type RoundedLinkProps = {
  href: string;
  label?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  className?: string;
};

export const RoundedLink = ({
  label,
  href,
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
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      className={clsx(styles.root, className)}
    >
      {label}
    </a>
  );
};
