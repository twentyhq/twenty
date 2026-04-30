import { type ComponentType } from 'react';
import { BookIcon } from './Book';
import { CheckIcon } from './Check';
import { CodeIcon } from './Code';
import { EditIcon } from './Edit';
import { EyeIcon } from './Eye';
import { SearchIcon } from './Search';
import { TagIcon } from './Tag';
import { UsersIcon } from './Users';

export { BookIcon } from './Book';
export { CheckIcon } from './Check';
export { CodeIcon } from './Code';
export { EditIcon } from './Edit';
export { EyeIcon } from './Eye';
export { SearchIcon } from './Search';
export { TagIcon } from './Tag';
export { UsersIcon } from './Users';

export type InformativeIconProps = {
  size: number;
  color: string;
  strokeWidth?: number;
};

export const INFORMATIVE_ICONS: Record<
  string,
  ComponentType<InformativeIconProps>
> = {
  book: BookIcon,
  check: CheckIcon,
  code: CodeIcon,
  edit: EditIcon,
  eye: EyeIcon,
  search: SearchIcon,
  tag: TagIcon,
  users: UsersIcon,
};
