import { createElement, type ComponentType } from 'react';
import { CheckIcon } from './Check';
import { EditIcon } from './Edit';
import { EyeIcon } from './Eye';
import { SearchIcon } from './Search';
import { UsersIcon } from './Users';

export { CheckIcon } from './Check';
export { EditIcon } from './Edit';
export { EyeIcon } from './Eye';
export { SearchIcon } from './Search';
export { UsersIcon } from './Users';

export type InformativeIconProps = { size: number; color: string };

function InformativeUsersIcon({ size, color }: InformativeIconProps) {
  return createElement(UsersIcon, { size, fillColor: color });
}

export const INFORMATIVE_ICONS: Record<
  string,
  ComponentType<InformativeIconProps>
> = {
  check: CheckIcon,
  edit: EditIcon,
  eye: EyeIcon,
  search: SearchIcon,
  users: InformativeUsersIcon,
};
