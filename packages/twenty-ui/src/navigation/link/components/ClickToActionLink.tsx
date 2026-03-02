import { styled } from '@linaria/react';
import React from 'react';

import { themeCssVariables } from '@ui/theme';

const StyledButtonLink = styled.a`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[1]};
  text-decoration: none;

  :hover {
    color: ${themeCssVariables.font.color.tertiary};
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
