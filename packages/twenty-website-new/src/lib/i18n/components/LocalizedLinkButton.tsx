'use client';

import {
  BaseButton,
  type BaseButtonProps,
  buttonBaseStyles,
} from '@/design-system/components/Button/BaseButton';
import type { LinkButtonType } from '@/design-system/components/Button/types/link-button-type';
import { styled } from '@linaria/react';

import { LocalizedLink } from './LocalizedLink';

const StyledButtonLink = styled(LocalizedLink)`
  ${buttonBaseStyles}
`;

type LocalizedLinkButtonProps = Omit<BaseButtonProps, 'label'> & LinkButtonType;

export function LocalizedLinkButton({
  color,
  href,
  label,
  leadingIcon,
  size = 'regular',
  variant,
}: LocalizedLinkButtonProps) {
  return (
    <StyledButtonLink
      data-color={color}
      data-size={size}
      data-variant={variant}
      href={href}
    >
      <BaseButton
        color={color}
        label={label}
        leadingIcon={leadingIcon}
        size={size}
        variant={variant}
      />
    </StyledButtonLink>
  );
}
