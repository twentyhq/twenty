import { clsx } from 'clsx';
import { useId } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../Dropdown.module.scss';
import { type DropdownSectionProps } from '../types/DropdownSectionProps';

export const DropdownSection = ({
  label,
  className,
  children,
  ...props
}: DropdownSectionProps) => {
  const labelId = useId();

  return (
    <div
      role="group"
      aria-labelledby={isDefined(label) ? labelId : undefined}
      {...props}
      className={clsx(styles.section, className)}
    >
      {isDefined(label) && (
        <div id={labelId} className={styles.sectionLabel}>
          {label}
        </div>
      )}
      {children}
    </div>
  );
};
