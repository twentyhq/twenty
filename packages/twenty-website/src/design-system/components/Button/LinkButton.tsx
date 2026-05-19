import type { LinkButtonType } from '@/design-system/components/Button/types/link-button-type';
import { styled } from '@linaria/react';
import {
  BaseButton,
  type BaseButtonProps,
  buttonBaseStyles,
} from './BaseButton';

const StyledButtonAnchor = styled.a`
  ${buttonBaseStyles}
`;

export type LinkButtonProps = Omit<BaseButtonProps, 'label'> & LinkButtonType;

export function LinkButton({
  color,
  href,
  label,
  leadingIcon,
  size = 'regular',
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
