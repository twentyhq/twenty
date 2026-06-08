import { styled } from '@linaria/react';
import React from 'react';

import { themeCssVariables } from '@ui/theme-constants';
import { Radio } from './Radio';

const StyledSubscriptionCardContainer = styled.button`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  cursor: pointer;
  display: flex;
  padding: 0;
  position: relative;
  text-align: left;
  width: 100%;
  :hover {
    background: ${themeCssVariables.background.tertiary};
  }
`;

const StyledCardInner = styled.div`
  display: flex;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]};
  width: 100%;
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
      <StyledCardInner>{children}</StyledCardInner>
    </StyledSubscriptionCardContainer>
  );
};
