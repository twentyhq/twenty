import { type CreateCommandMenuItemInput } from 'src/engine/metadata-modules/command-menu-item/dtos/create-command-menu-item.input';

export type CreateCommandMenuItemArgs = CreateCommandMenuItemInput & {
  coreWorkflowVersionId?: string;
};
