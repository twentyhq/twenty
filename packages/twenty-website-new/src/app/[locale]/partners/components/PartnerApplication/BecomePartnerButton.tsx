'use client';

import {
  BaseButton,
  buttonBaseStyles,
} from '@/design-system/components/Button/BaseButton';
import type { LocalizableText } from '@/lib/i18n/localizable-text';
import { usePartnerApplicationModal } from '@/lib/partner-application';
import { msg } from '@lingui/core/macro';
import { styled } from '@linaria/react';

const StyledTrigger = styled.button`
  ${buttonBaseStyles}
`;

type BecomePartnerButtonProps = {
  color?: 'primary' | 'secondary';
  label?: LocalizableText;
  variant?: 'contained' | 'outlined';
};

export function BecomePartnerButton({
  color = 'secondary',
  label = msg`Become a partner`,
  variant = 'contained',
}: BecomePartnerButtonProps) {
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
      <BaseButton color={color} label={label} variant={variant} />
    </StyledTrigger>
  );
}
