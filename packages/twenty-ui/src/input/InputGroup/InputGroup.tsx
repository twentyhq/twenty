import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './InputGroup.module.scss';
import { InputGroupContext } from './internal/InputGroupContext';
import { type InputGroupProps } from './types/InputGroupProps';

export const InputGroup = ({
  size = 'md',
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
      children: (
        <>
          {isDefined(startElement) && (
            <span className={styles.startElement}>{startElement}</span>
          )}
          {children}
          {isDefined(endElement) && (
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
