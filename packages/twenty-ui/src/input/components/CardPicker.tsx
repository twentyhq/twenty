import { styled } from '@linaria/react';
import React from 'react';

import { Radio } from './Radio';

const StyledSubscriptionCardContainer = styled.button`
  background-color: var(--background-secondary);
  border: 1px solid var(--border-color-medium);
  border-radius: var(--border-radius-md);
  display: flex;
  padding: var(--spacing-4) var(--spacing-3);
  position: relative;
  width: 100%;
  :hover {
    cursor: pointer;
    background: var(--background-tertiary);
  }
`;

const StyledRadioContainer = styled.div`
  position: absolute;
  right: var(--spacing-2);
  top: var(--spacing-2);
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
