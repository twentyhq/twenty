import { css } from '@linaria/core';
import { styled } from '@linaria/react';
import {
  ColorSample,
  type ColorSampleProps,
  type IconComponent,
} from '@ui/display';
import {
  LightIconButton,
  type LightIconButtonProps,
} from '@ui/input/button/components/LightIconButton';

type ColorPickerButtonProps = Pick<ColorSampleProps, 'colorName'> &
  Pick<LightIconButtonProps, 'onClick'> & {
    isSelected?: boolean;
  };

const StyledButton = styled(LightIconButton as any)<
  {
    isSelected?: boolean;
    size: 'small' | 'medium';
    Icon: IconComponent;
  } & Pick<ColorPickerButtonProps, 'onClick'>
>`
  ${({ isSelected }) =>
    isSelected
      ? css`
          background-color: var(--background-transparent-medium);

          &:hover {
            background-color: var(--background-transparent-medium);
          }
        `
      : ''}
`;

export const ColorPickerButton = ({
  colorName,
  isSelected,
  onClick,
}: ColorPickerButtonProps) => (
  <StyledButton
    size="medium"
    isSelected={isSelected}
    Icon={() => <ColorSample colorName={colorName} />}
    onClick={onClick}
  />
);
