import { styled } from '@linaria/react';
import * as React from 'react';
import { useContext } from 'react';
import { ThemeContext } from '@ui/theme';

const StyledClickableLink = styled.a<{
  maxWidth?: number;
  underlineColor: string;
  hoverColor: string;
}>`
  color: inherit;
  overflow: hidden;
  text-decoration: underline;
  text-decoration-color: ${({ underlineColor }) => underlineColor};
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;

  max-width: ${({ maxWidth }) => maxWidth ?? '100%'};

  &:hover {
    text-decoration-color: ${({ hoverColor }) => hoverColor};
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
  const { theme } = useContext(ThemeContext);

  return (
    <StyledClickableLink
      maxWidth={maxWidth}
      target="_blank"
      onClick={onClick}
      href={href}
      underlineColor={theme.border.color.strong}
      hoverColor={theme.font.color.primary}
    >
      {children}
    </StyledClickableLink>
  );
};
