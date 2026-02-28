import { styled } from '@linaria/react';
import React from 'react';

import { themeVar } from '@ui/theme';

const StyledButtonLink = styled.a`
  align-items: center;
  color: ${themeVar.font.color.light};
  display: flex;
  font-size: ${themeVar.font.size.sm};
  font-weight: ${themeVar.font.weight.medium};
  gap: ${themeVar.spacing[1]};
  padding: 0 ${themeVar.spacing[1]};
  text-decoration: none;

  :hover {
    color: ${themeVar.font.color.tertiary};
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
