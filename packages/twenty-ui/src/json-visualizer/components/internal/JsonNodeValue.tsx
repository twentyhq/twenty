import { styled } from '@linaria/react';
import { useJsonTreeContextOrThrow } from '@ui/json-visualizer/hooks/useJsonTreeContextOrThrow';
import { type JsonNodeHighlighting } from '@ui/json-visualizer/types/JsonNodeHighlighting';

const StyledText = styled.span<{
  highlighting: JsonNodeHighlighting | undefined;
}>`
  align-items: center;
  box-sizing: border-box;
  color: ${({ highlighting }) =>
    highlighting === 'blue'
      ? 'var(--adaptive-color-blue4)'
      : highlighting === 'red'
        ? 'var(--adaptive-color-red4)'
        : 'var(--font-color-tertiary)'};
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
