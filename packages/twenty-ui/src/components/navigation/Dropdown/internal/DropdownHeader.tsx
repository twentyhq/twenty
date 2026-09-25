import { LightIconButton } from '@ui/components/input/LightIconButton/LightIconButton';
import { IconChevronLeft, IconX } from '@ui/icon';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../Dropdown.module.scss';
import { type DropdownHeaderProps } from '../types/DropdownHeaderProps';

export const DropdownHeader = ({ children, action }: DropdownHeaderProps) => (
  <div className={styles.header}>
    {isDefined(action) && (
      <LightIconButton
        size="sm"
        aria-label={action.label}
        onClick={action.onClick}
      >
        {action.icon === 'close' ? <IconX /> : <IconChevronLeft />}
      </LightIconButton>
    )}
    {children}
  </div>
);
