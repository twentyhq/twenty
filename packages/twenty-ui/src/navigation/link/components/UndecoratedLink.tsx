import React from 'react';
import { Link } from 'react-router-dom';

import styles from './UndecoratedLink.module.scss';

type UndecoratedLinkProps = {
  to: string | number;
  children: React.ReactNode;
  replace?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  fullWidth?: boolean;
};

export const UndecoratedLink = ({
  children,
  to,
  replace = false,
  onClick,
  fullWidth = false,
}: UndecoratedLinkProps) => {
  return (
    <Link
      to={to as string}
      replace={replace}
      onClick={onClick}
      className={styles.undecoratedLink}
      style={fullWidth ? { width: '100%' } : undefined}
    >
      {children}
    </Link>
  );
};
