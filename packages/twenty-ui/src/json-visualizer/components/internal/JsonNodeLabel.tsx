import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type IconComponent } from '@ui/display';
import { type JsonNodeHighlighting } from '@ui/json-visualizer/types/JsonNodeHighlighting';

const StyledLabelContainer = styled.span<{
  highlighting?: JsonNodeHighlighting;
}>`
  align-items: center;
  background-color: ${({ theme, highlighting }) =>
    highlighting === 'blue'
      ? theme.color.blue3
      : highlighting === 'red'
        ? theme.background.danger
        : theme.background.transparent.lighter};
  border-color: ${({ theme, highlighting }) =>
    highlighting === 'blue'
      ? theme.color.blue5
      : highlighting === 'red'
        ? theme.border.color.danger
        : theme.border.color.medium};
  color: ${({ theme, highlighting }) =>
    highlighting === 'blue'
      ? theme.color.blue
      : highlighting === 'red'
        ? theme.font.color.danger
        : theme.font.color.primary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border-style: solid;
  border-width: 1px;
  height: 24px;
  box-sizing: border-box;
  column-gap: ${({ theme }) => theme.spacing(2)};
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  white-space: nowrap;
  padding-block: ${({ theme }) => theme.spacing(1)};
  padding-inline: ${({ theme }) => theme.spacing(2)};
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
  const theme = useTheme();

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
