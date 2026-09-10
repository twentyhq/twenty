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

  const valueClassName = clsx(
    styles.text,
    highlighting === 'blue' && styles.blue,
    highlighting === 'red' && styles.red,
  );

  if (isInteractive) {
    return (
      <span
        className={valueClassName}
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleClickableElementKeyDown}
      >
        {valueAsString}
      </span>
    );
  }

  return <span className={valueClassName}>{valueAsString}</span>;
};
