import React from 'react';
import { styled } from '@linaria/react';

import { theme } from '@ui/theme';
import { Radio } from './Radio';

const StyledSubscriptionCardContainer = styled.button`
  background-color: ${theme.background.secondary};
  border: 1px solid ${theme.border.color.medium};
  border-radius: ${theme.border.radius.md};
  display: flex;
  padding: ${theme.spacing[4]} ${theme.spacing[3]};
  position: relative;
  width: 100%;
  :hover {
    cursor: pointer;
    background: ${theme.background.tertiary};
  }
`;

const StyledRadioContainer = styled.div`
  position: absolute;
  right: ${theme.spacing[2]};
  top: ${theme.spacing[2]};
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
