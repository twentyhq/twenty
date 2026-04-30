import { styled } from '@linaria/react';
import {
  BaseButton,
  type BaseButtonProps,
  buttonBaseStyles,
} from './BaseButton';
import type { SubmitButtonType } from './types/SubmitButtonType';

const StyledSubmitButton = styled.button`
  ${buttonBaseStyles}
`;

export type SubmitButtonProps = Omit<BaseButtonProps, 'label'> &
  SubmitButtonType & { onClick?: () => void };

export function SubmitButton({
  color,
  label,
  leadingIcon,
  onClick,
  size = 'regular',
  variant,
}: SubmitButtonProps) {
  return (
    <StyledSubmitButton
      data-color={color}
      data-size={size}
      data-variant={variant}
      onClick={onClick}
      type="submit"
    >
      <BaseButton
        color={color}
        label={label}
        leadingIcon={leadingIcon}
        size={size}
        variant={variant}
      />
    </StyledSubmitButton>
  );
}
