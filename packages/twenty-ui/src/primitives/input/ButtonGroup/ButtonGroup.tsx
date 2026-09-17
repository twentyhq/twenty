import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import styles from './ButtonGroup.module.scss';
import { ButtonGroupContext } from './internal/ButtonGroupContext';
import { type ButtonGroupProps } from './types/ButtonGroupProps';

export const ButtonGroup = ({
  className,
  children,
  variant,
  size,
  color,
  render,
  ref,
  ...props
}: ButtonGroupProps) => {
  const element = useRender({
    render,
    ref,
    props: {
      role: 'group',
      ...props,
      className: clsx(styles.container, className),
      children,
    },
  });

  return (
    <ButtonGroupContext.Provider value={{ variant, color, size }}>
      {element}
    </ButtonGroupContext.Provider>
  );
};
