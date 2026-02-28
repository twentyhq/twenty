import { styled } from '@linaria/react';
import { ColorSample, type ColorSampleProps } from '@ui/display';
import { ThemeContext, type ThemeType } from '@ui/theme';
import {
  LightIconButton,
  type LightIconButtonProps,
} from '@ui/input/button/components/LightIconButton';
import { useContext } from 'react';

type ColorPickerButtonProps = Pick<ColorSampleProps, 'colorName'> &
  Pick<LightIconButtonProps, 'onClick'> & {
    isSelected?: boolean;
  };

const StyledButtonWrapper = styled.div<{
  isSelected?: boolean;
  theme: ThemeType;
}>`
  button {
    background-color: ${({ isSelected, theme }) =>
      isSelected ? theme.background.transparent.medium : 'inherit'};

    &:hover {
      background-color: ${({ isSelected, theme }) =>
        isSelected ? theme.background.transparent.medium : 'inherit'};
    }
  }
`;

export const ColorPickerButton = ({
  colorName,
  isSelected,
  onClick,
}: ColorPickerButtonProps) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledButtonWrapper isSelected={isSelected} theme={theme}>
      <LightIconButton
        size="medium"
        Icon={() => <ColorSample colorName={colorName} />}
        onClick={onClick}
      />
    </StyledButtonWrapper>
  );
};
