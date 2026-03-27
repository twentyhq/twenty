import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { ButtonShape } from './ButtonShape';

export const buttonBaseStyles = `
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${theme.radius(2)};
  cursor: pointer;
  display: inline-flex;
  font-family: ${theme.font.family.mono};
  font-size: ${theme.font.size(3)};
  font-weight: ${theme.font.weight.medium};
  height: ${theme.spacing(10)};
  justify-content: center;
  letter-spacing: 0;
  padding: 0 ${theme.spacing(5)};
  position: relative;
  text-decoration: none;
  text-transform: uppercase;

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }
`;

const Label = styled.span`
  position: relative;
  z-index: 1;

  &[data-color='primary'] {
    color: ${theme.colors.primary.text[100]};
  }

  &[data-color='secondary'] {
    color: ${theme.colors.secondary.text[100]};
  }
`;

export type BaseButtonProps = {
  color: 'primary' | 'secondary';
  label: string;
  variant: 'contained' | 'outlined';
};

export function BaseButton({ color, label, variant }: BaseButtonProps) {
  let fillColor: string;
  let strokeColor: string;
  let labelColor: 'primary' | 'secondary';

  switch (`${variant}.${color}`) {
    case 'contained.primary':
      fillColor = theme.colors.primary.background[100];
      strokeColor = 'none';
      labelColor = 'primary';
      break;
    case 'contained.secondary':
      fillColor = theme.colors.secondary.background[100];
      strokeColor = 'none';
      labelColor = 'secondary';
      break;
    case 'outlined.primary':
      fillColor = 'none';
      strokeColor = theme.colors.primary.background[100];
      labelColor = 'secondary';
      break;
    case 'outlined.secondary':
      fillColor = 'none';
      strokeColor = theme.colors.secondary.background[100];
      labelColor = 'primary';
      break;
    default:
      throw new Error(`Unhandled button appearance: ${variant} ${color}`);
  }

  return (
    <>
      <ButtonShape fillColor={fillColor} strokeColor={strokeColor} />
      <Label data-color={labelColor}>{label}</Label>
    </>
  );
}
