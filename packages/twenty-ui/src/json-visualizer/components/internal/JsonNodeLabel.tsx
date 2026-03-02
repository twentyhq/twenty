import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import { type JsonNodeHighlighting } from '@ui/json-visualizer/types/JsonNodeHighlighting';
import { ThemeContext, themeCssVariables } from '@ui/theme';
import { useContext } from 'react';

const StyledLabelContainer = styled.span<{
  highlighting?: JsonNodeHighlighting;
}>`
  background-color: ${({ highlighting }) =>
    highlighting === 'blue'
      ? themeCssVariables.color.blue3
      : highlighting === 'red'
        ? themeCssVariables.background.danger
        : themeCssVariables.background.transparent.lighter};
  border-color: ${({ highlighting }) =>
    highlighting === 'blue'
      ? themeCssVariables.color.blue5
      : highlighting === 'red'
        ? themeCssVariables.border.color.danger
        : themeCssVariables.border.color.medium};
  color: ${({ highlighting }) =>
    highlighting === 'blue'
      ? themeCssVariables.color.blue
      : highlighting === 'red'
        ? themeCssVariables.font.color.danger
        : themeCssVariables.font.color.primary};
  border-radius: ${themeCssVariables.border.radius.sm};
  border-style: solid;
  border-width: 1px;
  column-gap: ${themeCssVariables.spacing[2]};
  display: inline-flex;
  align-items: center;
  height: 24px;
  box-sizing: border-box;
  font-size: ${themeCssVariables.font.size.md};
  white-space: nowrap;
  padding-inline: ${themeCssVariables.spacing[2]};

  > span {
    align-items: center;
    display: inline-flex;
    line-height: 1;
  }
`;

export const JsonNodeLabel = ({
  label,
  Icon,
  highlighting,
}: {
  label: string;
  Icon: IconComponent;
  highlighting?: JsonNodeHighlighting | undefined;
}) => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledLabelContainer highlighting={highlighting}>
      <Icon
        size={theme.icon.size.md}
        color={
          highlighting === 'blue'
            ? theme.color.blue
            : highlighting === 'red'
              ? theme.font.color.danger
              : theme.font.color.tertiary
        }
      />

      <span>{label}</span>
    </StyledLabelContainer>
  );
};
