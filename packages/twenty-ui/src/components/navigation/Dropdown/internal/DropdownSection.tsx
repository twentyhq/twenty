import { clsx } from 'clsx';

import { MenuGroup } from '@ui/primitives/surfaces/Menu/internal/MenuGroup';
import { MenuGroupLabel } from '@ui/primitives/surfaces/Menu/internal/MenuGroupLabel';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../Dropdown.module.scss';
import { type DropdownSectionProps } from '../types/DropdownSectionProps';

export const DropdownSection = ({
  label,
  className,
  children,
  ...props
}: DropdownSectionProps) => (
  <MenuGroup {...props} className={clsx(styles.section, className)}>
    {isDefined(label) && <MenuGroupLabel>{label}</MenuGroupLabel>}
    {children}
  </MenuGroup>
);
