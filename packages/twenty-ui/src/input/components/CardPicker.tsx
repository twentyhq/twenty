import React from 'react';
import styled from '@emotion/styled';

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
};

export const CardPicker = ({
  children,
  checked,
  handleChange,
}: CardPickerProps) => {
  return (
    <StyledSubscriptionCardContainer onClick={handleChange}>
      <StyledRadioContainer>
        <Radio checked={checked} />
      </StyledRadioContainer>
      {children}
    </StyledSubscriptionCardContainer>
  );
};
