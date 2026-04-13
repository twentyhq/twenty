'use client';

import {
  BaseButton,
  buttonBaseStyles,
} from '@/design-system/components/Button/BaseButton';
import { styled } from '@linaria/react';

import { usePartnerApplicationModal } from './PartnerApplicationModalRoot';

const StyledTrigger = styled.button`
  ${buttonBaseStyles}
`;

export function BecomePartnerButton() {
  const { openPartnerApplicationModal } = usePartnerApplicationModal();

  return (
    <StyledTrigger type="button" onClick={openPartnerApplicationModal}>
      <BaseButton
        color="secondary"
        label="Become a partner"
        variant="contained"
      />
    </StyledTrigger>
  );
}
