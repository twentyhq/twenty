import { styled } from '@linaria/react';
import * as React from 'react';
import { Link as ReactLink } from 'react-router-dom';

type RawLinkProps = {
  className?: string;
  href: string;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
};

const StyledClickable = styled.div`
  display: flex;
  overflow: hidden;
  white-space: nowrap;

  a {
    color: inherit;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const RawLink = ({
  className,
  href,
  children,
  onClick,
}: RawLinkProps) => (
  <div>
    <StyledClickable className={className}>
      <ReactLink target="_blank" onClick={onClick} to={href}>
        {children}
      </ReactLink>
    </StyledClickable>
  </div>
);
