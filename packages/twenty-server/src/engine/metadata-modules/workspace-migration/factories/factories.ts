import { BasicColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/factories/basic-column-action.factory';
import { EnumColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/factories/enum-column-action.factory';

export const workspaceColumnActionFactories = [
  BasicColumnActionFactory,
  EnumColumnActionFactory,
];
