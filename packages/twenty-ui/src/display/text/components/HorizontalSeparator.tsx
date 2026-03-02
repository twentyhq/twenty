import { styled } from '@linaria/react';
import { type JSX, useContext } from 'react';
import { Label } from '@ui/display';
import { THEME_COMMON, ThemeContext } from '@ui/theme';

const spacing3 = THEME_COMMON.spacing(3);
const spacing2 = THEME_COMMON.spacing(2);

type HorizontalSeparatorProps = {
  visible?: boolean;
  text?: string;
  noMargin?: boolean;
  color?: string;
};

const StyledSeparator = styled.div<{
  visible: boolean;
  noMargin: boolean;
  backgroundColor: string;
}>`
  background-color: ${({ backgroundColor }) => backgroundColor};
  height: ${({ visible }) => (visible ? '1px' : '0')};
  flex-shrink: 0;
  margin-bottom: ${({ noMargin }) => (noMargin ? '0' : spacing3)};
  margin-top: ${({ noMargin }) => (noMargin ? '0' : spacing3)};
  width: 100%;
`;

const StyledSeparatorContainer = styled.div<{ noMargin: boolean }>`
  align-items: center;
  display: flex;
  margin-bottom: ${({ noMargin }) => (noMargin ? '0' : spacing3)};
  margin-top: ${({ noMargin }) => (noMargin ? '0' : spacing3)};
  width: 100%;
`;

const StyledLine = styled.div<{
  visible: boolean;
  backgroundColor: string;
}>`
  background-color: ${({ backgroundColor }) => backgroundColor};
  height: ${({ visible }) => (visible ? '1px' : '0')};
  flex-grow: 1;
`;

const StyledText = styled.span`
  margin: 0 ${spacing2};
`;

export const HorizontalSeparator = ({
  visible = true,
  text = '',
  noMargin = false,
  color,
}: HorizontalSeparatorProps): JSX.Element => {
  const { theme } = useContext(ThemeContext);
  const borderColor = color ?? theme.border.color.medium;

  return (
    <>
      {text ? (
        <StyledSeparatorContainer noMargin={noMargin}>
          <StyledLine visible={visible} backgroundColor={borderColor} />
          <Label>
            <StyledText>{text}</StyledText>
          </Label>
          <StyledLine visible={visible} backgroundColor={borderColor} />
        </StyledSeparatorContainer>
      ) : (
        <StyledSeparator
          visible={visible}
          noMargin={noMargin}
          backgroundColor={borderColor}
        />
      )}
    </>
  );
};
