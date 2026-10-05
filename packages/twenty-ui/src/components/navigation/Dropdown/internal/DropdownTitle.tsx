import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';

import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';

import styles from '../Dropdown.module.scss';
import { type DropdownTitleProps } from '../types/DropdownTitleProps';
import { useDropdownContext } from './useDropdownContext';
import { useRegisterDropdownLabelElement } from './useRegisterDropdownLabelElement';

export const DropdownTitle = ({
  className,
  render,
  ref,
  ...props
}: DropdownTitleProps) => {
  const { registerTitle } = useDropdownContext();
  const registerTitleElement = useRegisterDropdownLabelElement(registerTitle);
  const mergedRef = useMergedRefs(ref, registerTitleElement);

  return (
    <PopoverPrimitive.Title
      {...props}
      ref={mergedRef}
      render={render ?? <div />}
      className={mergeClassNames(styles.title, className)}
    />
  );
};
