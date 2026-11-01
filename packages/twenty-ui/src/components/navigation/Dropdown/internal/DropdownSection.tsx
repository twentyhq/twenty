import { isPositiveInteger } from '@sniptt/guards';
import { clsx } from 'clsx';

import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../Dropdown.module.scss';
import { DropdownGroup } from './DropdownGroup';
import { DropdownGroupLabel } from './DropdownGroupLabel';
import { type DropdownSectionProps } from '../types/DropdownSectionProps';

export const DropdownSection = ({
  label,
  scrollable,
  columns,
  style,
  className,
  children,
  ...props
}: DropdownSectionProps) => {
  const gridColumns = isPositiveInteger(columns) ? columns : undefined;

  return (
    <DropdownGroup
      {...props}
      data-scrollable={scrollable || undefined}
      data-dropdown-columns={gridColumns}
      style={{
        ...style,
        ...(isDefined(gridColumns) && {
          gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))`,
        }),
      }}
      className={clsx(styles.section, className)}
    >
      {isDefined(label) && (
        <DropdownGroupLabel data-dropdown-section-label="">
          {label}
        </DropdownGroupLabel>
      )}
      {children}
    </DropdownGroup>
  );
};
