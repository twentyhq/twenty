import type { LinkButtonType } from '@/design-system/components/Button/types/LinkButtonType';
import { styled } from '@linaria/react';
import {
  BaseButton,
  type BaseButtonProps,
  buttonBaseStyles,
} from './BaseButton';

const StyledButtonAnchor = styled.a`
  ${buttonBaseStyles}
`;

export type LinkButtonPresentation = 'anchor' | 'link';

export type LinkButtonProps = Omit<BaseButtonProps, 'label'> &
  LinkButtonType & { type: LinkButtonPresentation };

export function LinkButton({
  color,
  href,
  label,
  leadingIcon,
  size = 'regular',
  type,
  variant,
}: LinkButtonProps) {
  const inner = (
    <BaseButton
      color={color}
      label={label}
      leadingIcon={leadingIcon}
      size={size}
      variant={variant}
    />
  );

  if (type === 'anchor') {
    return (
      <StyledButtonAnchor
        data-color={color}
        data-size={size}
        data-variant={variant}
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {inner}
      </StyledButtonAnchor>
    );
  }

  return (
    <StyledButtonAnchor
      data-color={color}
      data-size={size}
      data-variant={variant}
      href={href}
    >
      {inner}
    </StyledButtonAnchor>
  );
}
