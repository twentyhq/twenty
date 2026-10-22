import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import styles from './InputGroup.module.scss';
import { InputGroupContext } from './internal/InputGroupContext';
import { isRenderableAdornment } from './internal/isRenderableAdornment';
import { type InputGroupProps } from './types/InputGroupProps';

export const InputGroup = ({
  size = 'md',
  focusRing = true,
  startElement,
  endElement,
  className,
  children,
  render,
  ref,
  ...props
}: InputGroupProps) => {
  const element = useRender({
    render,
    ref,
    props: {
      ...props,
      className: clsx(styles.root, styles[size], className),
      'data-focus-ring': focusRing,
      children: (
        <>
          {isRenderableAdornment(startElement) && (
            <span className={styles.startElement}>{startElement}</span>
          )}
          {children}
          {isRenderableAdornment(endElement) && (
            <span className={styles.endElement}>{endElement}</span>
          )}
        </>
      ),
    },
  });

  return (
    <InputGroupContext.Provider value={{ size }}>
      {element}
    </InputGroupContext.Provider>
  );
};
