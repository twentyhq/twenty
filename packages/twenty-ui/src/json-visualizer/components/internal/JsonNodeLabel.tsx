import { styled } from '@linaria/react';
import { type IconComponent } from '@ui/display';
import { type JsonNodeHighlighting } from '@ui/json-visualizer/types/JsonNodeHighlighting';
import { ThemeContext, theme } from '@ui/theme';
import { useContext } from 'react';

const StyledLabelContainer = styled.span<{
  highlighting?: JsonNodeHighlighting;
}>`
  background-color: ${({ highlighting }) =>
    highlighting === 'blue'
      ? theme.color.blue3
      : highlighting === 'red'
        ? theme.background.danger
        : theme.background.transparent.lighter};
  border-color: ${({ highlighting }) =>
    highlighting === 'blue'
      ? theme.color.blue5
      : highlighting === 'red'
        ? theme.border.color.danger
        : theme.border.color.medium};
  color: ${({ highlighting }) =>
    highlighting === 'blue'
      ? theme.color.blue
      : highlighting === 'red'
        ? theme.font.color.danger
        : theme.font.color.primary};
  border-radius: ${theme.border.radius.sm};
  border-style: solid;
  border-width: 1px;
  column-gap: ${theme.spacing[2]};
  display: inline-flex;
  align-items: center;
  height: 24px;
  box-sizing: border-box;
  font-size: ${theme.font.size.md};
  white-space: nowrap;
  padding-inline: ${theme.spacing[2]};

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
