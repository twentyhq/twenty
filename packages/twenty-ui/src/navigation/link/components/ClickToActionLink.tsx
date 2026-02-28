import { styled } from '@linaria/react';
import React from 'react';

import { theme } from '@ui/theme';

const StyledButtonLink = styled.a`
  align-items: center;
  color: ${theme.font.color.light};
  display: flex;
  font-size: ${theme.font.size.sm};
  font-weight: ${theme.font.weight.medium};
  gap: ${theme.spacing[1]};
  padding: 0 ${theme.spacing[1]};
  text-decoration: none;

  :hover {
    color: ${theme.font.color.tertiary};
    cursor: pointer;
  }
`;

type ClickToActionLinkProps = React.ComponentProps<'a'> & {
  className?: string;
};

export const ClickToActionLink = (props: ClickToActionLinkProps) => {
  return (
    <StyledButtonLink
      className={props.className}
      href={props.href}
      onClick={props.onClick}
      target={props.target}
      rel={props.rel}
    >
      {props.children}
    </StyledButtonLink>
  );
};
