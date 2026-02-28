import { styled } from '@linaria/react';
import { useJsonTreeContextOrThrow } from '@ui/json-visualizer/hooks/useJsonTreeContextOrThrow';
import { type JsonNodeHighlighting } from '@ui/json-visualizer/types/JsonNodeHighlighting';
import { theme } from '@ui/theme';

const StyledText = styled.span<{
  highlighting: JsonNodeHighlighting | undefined;
}>`
  align-items: center;
  box-sizing: border-box;
  color: ${({ highlighting }) =>
    highlighting === 'blue'
      ? theme.color.blue8
      : highlighting === 'red'
        ? theme.color.red8
        : theme.font.color.tertiary};
  display: inline-flex;
  height: 24px;
  line-height: 1;
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
