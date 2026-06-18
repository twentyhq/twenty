import { clsx } from 'clsx';
import * as React from 'react';
import { Link as ReactLink } from 'react-router-dom';

import styles from './RawLink.module.scss';

type RawLinkProps = {
  className?: string;
  href: string;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

export const RawLink = ({
  className,
  href,
  children,
  onClick,
}: RawLinkProps) => (
  <div>
    <div className={clsx(styles.clickable, className)}>
      <ReactLink target="_blank" onClick={onClick} to={href}>
        {children}
      </ReactLink>
    </div>
  </div>
);
