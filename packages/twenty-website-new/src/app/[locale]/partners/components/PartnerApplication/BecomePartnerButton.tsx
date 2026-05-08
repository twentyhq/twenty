'use client';

import {
  BaseButton,
  buttonBaseStyles,
} from '@/design-system/components/Button/BaseButton';
import { useRenderMessage } from '@/lib/i18n/use-render-message';
import { usePartnerApplicationModal } from '@/lib/partner-application';
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
  const renderText = useRenderMessage();
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
      <BaseButton color={color} label={renderText(label)} variant={variant} />
    </StyledTrigger>
  );
}
