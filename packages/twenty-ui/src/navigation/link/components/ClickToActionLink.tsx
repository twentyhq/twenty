import { styled } from '@linaria/react';
import React, { useContext } from 'react';

import { ThemeContext, type ThemeType } from '@ui/theme';

const StyledButtonLink = styled.a<{ theme: ThemeType }>`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: 0 ${({ theme }) => theme.spacing(1)};
  text-decoration: none;

  :hover {
    color: ${({ theme }) => theme.font.color.tertiary};
    cursor: pointer;
  }
`;

type ClickToActionLinkProps = React.ComponentProps<'a'> & {
  className?: string;
};

export const ClickToActionLink = (props: ClickToActionLinkProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledButtonLink
      className={props.className}
      href={props.href}
      onClick={props.onClick}
      target={props.target}
      rel={props.rel}
      theme={theme}
    >
      {props.children}
    </StyledButtonLink>
  );
};
