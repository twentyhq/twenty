import type { LinkButtonType } from '@/design-system/components/Button/types/LinkButtonType';
import { styled } from '@linaria/react';
import Link from 'next/link';
import {
  BaseButton,
  type BaseButtonProps,
  buttonBaseStyles,
} from './BaseButton';

const StyledButtonAnchor = styled.a`
  ${buttonBaseStyles}
`;

const StyledButtonLink = styled(Link)`
  ${buttonBaseStyles}
`;

export type LinkButtonPresentation = 'anchor' | 'link';

export type LinkButtonProps = Omit<BaseButtonProps, 'label'> &
  LinkButtonType & { type: LinkButtonPresentation };

export function LinkButton({
  color,
  href,
  label,
  type,
  variant,
}: LinkButtonProps) {
  const inner = <BaseButton color={color} label={label} variant={variant} />;

  if (type === 'anchor') {
    return (
      <StyledButtonAnchor
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {inner}
      </StyledButtonAnchor>
    );
  }

  return (
    <StyledButtonLink href={href}>
      {inner}
    </StyledButtonLink>
  );
}
