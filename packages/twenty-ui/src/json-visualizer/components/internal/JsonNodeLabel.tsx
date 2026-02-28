import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import { type JsonNodeHighlighting } from '@ui/json-visualizer/types/JsonNodeHighlighting';
import { ThemeContext, themeVar } from '@ui/theme';
import { useContext } from 'react';

const StyledLabelContainer = styled.span<{
  highlighting?: JsonNodeHighlighting;
}>`
  background-color: ${({ highlighting }) =>
    highlighting === 'blue'
      ? themeVar.color.blue3
      : highlighting === 'red'
        ? themeVar.background.danger
        : themeVar.background.transparent.lighter};
  border-color: ${({ highlighting }) =>
    highlighting === 'blue'
      ? themeVar.color.blue5
      : highlighting === 'red'
        ? themeVar.border.color.danger
        : themeVar.border.color.medium};
  color: ${({ highlighting }) =>
    highlighting === 'blue'
      ? themeVar.color.blue
      : highlighting === 'red'
        ? themeVar.font.color.danger
        : themeVar.font.color.primary};
  border-radius: ${themeVar.border.radius.sm};
  border-style: solid;
  border-width: 1px;
  column-gap: ${themeVar.spacing[2]};
  display: inline-flex;
  align-items: center;
  height: 24px;
  box-sizing: border-box;
  font-size: ${themeVar.font.size.md};
  white-space: nowrap;
  padding-inline: ${themeVar.spacing[2]};

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
