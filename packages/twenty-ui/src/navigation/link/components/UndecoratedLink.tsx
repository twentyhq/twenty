import { css } from '@linaria/core';
import React from 'react';
import { Link } from 'react-router-dom';

// Linaria's styled(anonymousFunction) pattern strips the function body during
// build, so we use the css tag and apply it directly on the Link component.
const undecoratedLinkClass = css`
  text-decoration: none;
`;

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
      className={undecoratedLinkClass}
      style={fullWidth ? { width: '100%' } : undefined}
    >
      {children}
    </Link>
  );
};
