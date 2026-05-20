'use client';

import {
  BaseButton,
  buttonBaseStyles,
} from '@/design-system/components/Button/BaseButton';
import { useLingui } from '@lingui/react';
import { usePartnerApplicationModal } from '@/sections/PartnerApplication';
import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

const StyledTrigger = styled.button`
  ${buttonBaseStyles}
`;

type BecomePartnerButtonProps = {
  color?: 'primary' | 'secondary';
  label?: MessageDescriptor;
  variant?: 'contained' | 'outlined';
};

export function BecomePartnerButton({
  color = 'secondary',
  label = msg`Become a partner`,
  variant = 'contained',
}: BecomePartnerButtonProps) {
  const { i18n } = useLingui();
  const { openPartnerApplicationModal } = usePartnerApplicationModal();

  return (
    <StyledTrigger
      data-color={color}
      data-variant={variant}
      type="button"
      onClick={() => {
        openPartnerApplicationModal();
      }}
    >
      <BaseButton color={color} label={i18n._(label)} variant={variant} />
    </StyledTrigger>
  );
}
