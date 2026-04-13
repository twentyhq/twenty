import { theme } from '@/theme';
import { styled } from '@linaria/react';
import { ButtonShape } from './ButtonShape';

export const buttonBaseStyles = `
  --button-label-color: ${theme.colors.primary.text[100]};
  --button-label-hover-color: ${theme.colors.secondary.text[100]};

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
  overflow: hidden;
  padding: 0 ${theme.spacing(5)};
  position: relative;
  text-decoration: none;
  text-transform: uppercase;

  &[data-variant='contained'][data-color='secondary'] {
    --button-label-color: ${theme.colors.secondary.text[100]};
    --button-label-hover-color: ${theme.colors.secondary.text[100]};
  }

  &[data-variant='outlined'][data-color='secondary'] {
    --button-label-color: ${theme.colors.primary.text[100]};
    --button-label-hover-color: ${theme.colors.primary.text[100]};
  }

  &[data-variant='outlined'][data-color='primary'] {
    --button-label-color: ${theme.colors.secondary.text[100]};
    --button-label-hover-color: ${theme.colors.primary.text[100]};
  }

  &:is(:hover, :focus-visible) {
    --button-label-color: var(--button-label-hover-color);
  }

  &:is(:hover, :focus-visible) [data-slot='button-hover-fill'] {
    transform: translateX(0);
  }

  &[data-variant='outlined'] [data-slot='button-base-shape'] {
    z-index: 1;
  }

  &:focus-visible {
    outline: 1px solid ${theme.colors.highlight[100]};
    outline-offset: 1px;
  }
`;

const Label = styled.span`
  color: var(--button-label-color);
  position: relative;
  transition: color 220ms ease;
  z-index: 1;
`;

export type BaseButtonProps = {
  color: 'primary' | 'secondary';
  label: string;
  variant: 'contained' | 'outlined';
};

const secondaryContainedHoverFillColor = theme.colors.secondary.background.hover;
const secondaryOutlinedHoverFillColor = theme.colors.primary.text[100];
const secondaryOutlinedHoverFillOpacity = 0.05;

const HoverFill = styled.span`
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  transform: translateX(calc(-100% - ${theme.spacing(4)}));
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 0;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

export function BaseButton({ color, label, variant }: BaseButtonProps) {
  let fillColor: string;
  let hoverFillColor: string;
  let hoverFillOpacity = 1;
  let strokeColor: string;

  switch (`${variant}.${color}`) {
    case 'contained.primary':
      fillColor = theme.colors.primary.background[100];
      hoverFillColor = theme.colors.primary.background.hover;
      strokeColor = 'none';
      break;
    case 'contained.secondary':
      fillColor = theme.colors.secondary.background[100];
      hoverFillColor = secondaryContainedHoverFillColor;
      strokeColor = 'none';
      break;
    case 'outlined.primary':
      fillColor = 'none';
      hoverFillColor = theme.colors.primary.background[100];
      strokeColor = theme.colors.primary.background[100];
      break;
    case 'outlined.secondary':
      fillColor = 'none';
      hoverFillColor = secondaryOutlinedHoverFillColor;
      hoverFillOpacity = secondaryOutlinedHoverFillOpacity;
      strokeColor = theme.colors.secondary.background[100];
      break;
    default:
      throw new Error(`Unhandled button appearance: ${variant} ${color}`);
  }

  return (
    <>
      <ButtonShape
        dataSlot="button-base-shape"
        fillColor={fillColor}
        strokeColor={strokeColor}
      />
      <HoverFill data-slot="button-hover-fill" style={{ opacity: hoverFillOpacity }}>
        <ButtonShape fillColor={hoverFillColor} strokeColor="none" />
      </HoverFill>
      <Label data-slot="button-label">{label}</Label>
    </>
  );
}
