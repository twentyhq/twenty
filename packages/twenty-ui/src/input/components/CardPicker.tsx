import React from 'react';
import { styled } from '@linaria/react';

import { themeVar } from '@ui/theme';
import { Radio } from './Radio';

const StyledSubscriptionCardContainer = styled.button`
  background-color: ${themeVar.background.secondary};
  border: 1px solid ${themeVar.border.color.medium};
  border-radius: ${themeVar.border.radius.md};
  display: flex;
  padding: ${themeVar.spacing[4]} ${themeVar.spacing[3]};
  position: relative;
  width: 100%;
  :hover {
    cursor: pointer;
    background: ${themeVar.background.tertiary};
  }
`;

const StyledRadioContainer = styled.div`
  position: absolute;
  right: ${themeVar.spacing[2]};
  top: ${themeVar.spacing[2]};
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
