import { isPositiveInteger } from '@sniptt/guards';
import { clsx } from 'clsx';

import { MenuGroup } from '@ui/primitives/surfaces/Menu/internal/MenuGroup';
import { MenuGroupLabel } from '@ui/primitives/surfaces/Menu/internal/MenuGroupLabel';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../Dropdown.module.scss';
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
    <MenuGroup
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
        <MenuGroupLabel data-dropdown-section-label="">{label}</MenuGroupLabel>
      )}
      {children}
    </MenuGroup>
  );
};
