import styled from '@emotion/styled';
import { useJsonTreeContextOrThrow } from '@ui/json-visualizer/hooks/useJsonTreeContextOrThrow';
import { JsonNodeHighlighting } from '@ui/json-visualizer/types/JsonNodeHighlighting';

const StyledText = styled.span<{
  highlighting: JsonNodeHighlighting | undefined;
}>`
  align-items: center;
  box-sizing: border-box;
  color: ${({ theme, highlighting }) =>
    highlighting === 'blue'
      ? theme.adaptiveColors.blue4
      : highlighting === 'red'
        ? theme.adaptiveColors.red4
        : theme.font.color.tertiary};
  display: inline-flex;
  height: 24px;
`;

export const JsonNodeValue = ({
  valueAsString,
  highlighting,
}: {
  valueAsString: string;
  highlighting?: JsonNodeHighlighting | undefined;
}) => {
  const { onNodeValueClick } = useJsonTreeContextOrThrow();

  const handleClick = () => {
    onNodeValueClick?.(valueAsString);
  };

  return (
    <StyledText highlighting={highlighting} onClick={handleClick}>
      {valueAsString}
    </StyledText>
  );
};
