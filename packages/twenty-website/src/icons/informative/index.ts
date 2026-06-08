import { type ComponentType } from 'react';
import { BookIcon } from './Book';
import { ChartIcon } from './Chart';
import { ChecklistIcon } from './Checklist';
import { CheckIcon } from './Check';
import { CodeIcon } from './Code';
import { EditIcon } from './Edit';
import { EyeIcon } from './Eye';
import { KanbanIcon } from './Kanban';
import { LightbulbIcon } from './Lightbulb';
import { SearchIcon } from './Search';
import { TagIcon } from './Tag';
import { UsersIcon } from './Users';
import { WorkflowIcon } from './Workflow';

export { BookIcon } from './Book';
export { ChartIcon } from './Chart';
export { ChecklistIcon } from './Checklist';
export { CheckIcon } from './Check';
export { CodeIcon } from './Code';
export { EditIcon } from './Edit';
export { EyeIcon } from './Eye';
export { KanbanIcon } from './Kanban';
export { LightbulbIcon } from './Lightbulb';
export { SearchIcon } from './Search';
export { TagIcon } from './Tag';
export { UsersIcon } from './Users';
export { WorkflowIcon } from './Workflow';

export type InformativeIconProps = {
  size: number;
  color: string;
  strokeWidth?: number;
};

export const INFORMATIVE_ICONS = {
  book: BookIcon,
  chart: ChartIcon,
  check: CheckIcon,
  checklist: ChecklistIcon,
  code: CodeIcon,
  edit: EditIcon,
  eye: EyeIcon,
  kanban: KanbanIcon,
  lightbulb: LightbulbIcon,
  search: SearchIcon,
  tag: TagIcon,
  users: UsersIcon,
  workflow: WorkflowIcon,
} satisfies Record<string, ComponentType<InformativeIconProps>>;

export type InformativeIconKey = keyof typeof INFORMATIVE_ICONS;
