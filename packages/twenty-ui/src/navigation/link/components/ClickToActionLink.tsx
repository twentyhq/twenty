import { styled } from '@linaria/react';
import React from 'react';

const StyledButtonLink = styled.a`
  align-items: center;
  color: var(--font-color-light);
  display: flex;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  gap: var(--spacing-1);
  padding: 0 var(--spacing-1);
  text-decoration: none;

  :hover {
    color: var(--font-color-tertiary);
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
