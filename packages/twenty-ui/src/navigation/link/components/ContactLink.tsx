import { styled } from '@linaria/react';
import * as React from 'react';

import { themeVar } from '@ui/theme';

const StyledClickableLink = styled.a<{
  maxWidth?: number;
}>`
  color: inherit;
  overflow: hidden;
  text-decoration: underline;
  text-decoration-color: ${themeVar.border.color.strong};
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;

  max-width: ${({ maxWidth }) => maxWidth ?? '100%'};

  &:hover {
    text-decoration-color: ${themeVar.font.color.primary};
  }
`;

type ContactLinkProps = {
  href: string;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  maxWidth?: number;
};

export const ContactLink = ({
  href,
  children,
  onClick,
  maxWidth,
}: ContactLinkProps) => {
  return (
    <StyledClickableLink
      maxWidth={maxWidth}
      target="_blank"
      onClick={onClick}
      href={href}
    >
      {children}
    </StyledClickableLink>
  );
};
