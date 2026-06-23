import { handleClickableElementKeyDown } from '@ui/accessibility/utils/handleClickableElementKeyDown';
import { useJsonTreeContextOrThrow } from '@ui/json-visualizer/hooks/useJsonTreeContextOrThrow';
import { type JsonNodeHighlighting } from '@ui/json-visualizer/types/JsonNodeHighlighting';
import { clsx } from 'clsx';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './JsonNodeValue.module.scss';

export const JsonNodeValue = ({
  valueAsString,
  highlighting,
}: {
  valueAsString: string;
  highlighting?: JsonNodeHighlighting | undefined;
}) => {
  const { onNodeValueClick } = useJsonTreeContextOrThrow();

  const isInteractive = isDefined(onNodeValueClick);

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
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? handleClick : undefined}
      onKeyDown={handleClickableElementKeyDown}
    >
      {valueAsString}
    </span>
  );
};
