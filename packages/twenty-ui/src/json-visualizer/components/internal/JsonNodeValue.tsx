import styled from '@emotion/styled';
import { JsonNodeHighlighting } from '@ui/json-visualizer/types/JsonNodeHighlighting';

const StyledText = styled.span<{
  highlighting: JsonNodeHighlighting | undefined;
}>`
  color: ${({ theme, highlighting }) =>
    highlighting === 'blue'
      ? theme.adaptiveColors.blue4
      : highlighting === 'red'
        ? theme.font.color.danger
        : theme.font.color.tertiary};
`;

export const JsonNodeValue = ({
  valueAsString,
  highlighting,
}: {
  valueAsString: string;
  highlighting?: JsonNodeHighlighting | undefined;
}) => {
  return <StyledText highlighting={highlighting}>{valueAsString}</StyledText>;
};
