import { styled } from '@linaria/react';
import React from 'react';

const StyledContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semi-bold);
  color: var(--font-color-extra-light);

  &:before,
  &:after {
    content: '';
    height: 1px;
    flex-grow: 1;
    background: var(--background-transparent-light);
  }

  &:before {
    margin: 0 var(--spacing-4) 0 0;
  }
  &:after {
    margin: 0 0 0 var(--spacing-4);
  }
`;

export const SeparatorLineText = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <StyledContainer>{children}</StyledContainer>;
};
