import styled from '@emotion/styled';
import React from 'react';

import { Radio } from './Radio';

const StyledSubscriptionCardContainer = styled.button`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(3)};
  position: relative;
  width: 100%;
  :hover {
    cursor: pointer;
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledRadioContainer = styled.div`
  position: absolute;
  right: ${({ theme }) => theme.spacing(2)};
  top: ${({ theme }) => theme.spacing(2)};
`;

type CardPickerProps = {
  children: React.ReactNode;
  handleChange?: () => void;
  checked?: boolean;
  name: string;
};

export const CardPicker = ({
  children,
  checked,
  handleChange,
  name,
}: CardPickerProps) => {
  return (
    <StyledSubscriptionCardContainer onClick={handleChange}>
      <StyledRadioContainer>
        <Radio name={name} checked={checked} />
      </StyledRadioContainer>
      {children}
    </StyledSubscriptionCardContainer>
  );
};
