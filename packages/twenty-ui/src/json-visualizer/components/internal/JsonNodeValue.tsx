import { useJsonTreeContextOrThrow } from '@ui/json-visualizer/hooks/useJsonTreeContextOrThrow';
import { type JsonNodeHighlighting } from '@ui/json-visualizer/types/JsonNodeHighlighting';
import { clsx } from 'clsx';

import styles from './JsonNodeValue.module.scss';

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
    <span
      className={clsx(
        styles.text,
        highlighting === 'blue' && styles.blue,
        highlighting === 'red' && styles.red,
      )}
      onClick={handleClick}
    >
      {valueAsString}
    </span>
  );
};
