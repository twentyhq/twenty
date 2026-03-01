import { styled } from '@linaria/react';
import { ColorSample, type ColorSampleProps } from '@ui/display';
import { themeCssVariables } from '@ui/theme';
import {
  LightIconButton,
  type LightIconButtonProps,
} from '@ui/input/button/components/LightIconButton';

type ColorPickerButtonProps = Pick<ColorSampleProps, 'colorName'> &
  Pick<LightIconButtonProps, 'onClick'> & {
    isSelected?: boolean;
  };

const StyledButtonWrapper = styled.div<{
  isSelected?: boolean;
}>`
  button {
    ${({ isSelected }) =>
      isSelected
        ? `background-color: ${themeCssVariables.background.transparent.medium};`
        : ''}
  }

  button:hover {
    ${({ isSelected }) =>
      isSelected
        ? `background-color: ${themeCssVariables.background.transparent.medium};`
        : ''}
  }
`;

export const ColorPickerButton = ({
  colorName,
  isSelected,
  onClick,
}: ColorPickerButtonProps) => {
  return (
    <StyledButtonWrapper isSelected={isSelected}>
      <LightIconButton
        size="medium"
        Icon={() => <ColorSample colorName={colorName} />}
        onClick={onClick}
      />
    </StyledButtonWrapper>
  );
};
