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
  onClick,
  variant,
}: SubmitButtonProps) {
  return (
    <StyledSubmitButton type="submit" onClick={onClick}>
      <BaseButton color={color} label={label} variant={variant} />
    </StyledSubmitButton>
  );
}
