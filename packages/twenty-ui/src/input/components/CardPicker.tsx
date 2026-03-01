import React from 'react';
import { styled } from '@linaria/react';

import { themeCssVariables } from '@ui/theme';
import { Radio } from './Radio';

const StyledSubscriptionCardContainer = styled.button`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]};
  position: relative;
  width: 100%;
  :hover {
    cursor: pointer;
    background: ${themeCssVariables.background.tertiary};
  }
`;

const StyledRadioContainer = styled.div`
  position: absolute;
  right: ${themeCssVariables.spacing[2]};
  top: ${themeCssVariables.spacing[2]};
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
