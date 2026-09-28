import { useJsonTreeContextOrThrow } from '@ui/components/data-display/JsonTree/internal/hooks/useJsonTreeContextOrThrow';
import { type JsonNodeHighlighting } from '@ui/components/data-display/JsonTree/types/JsonNodeHighlighting';
import { handleClickableElementKeyDown } from '@ui/primitives/accessibility/utils/handleClickableElementKeyDown';
import { isDefined } from '@ui/utilities/utils/isDefined';
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
