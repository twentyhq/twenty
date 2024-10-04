import { BasicColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/factories/basic-column-action.factory';
import { CompositeColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';
import { EnumColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/factories/enum-column-action.factory';
import { TsVectorColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/factories/ts-vector-column-action.factory';

export const workspaceColumnActionFactories = [
  TsVectorColumnActionFactory,
  BasicColumnActionFactory,
  EnumColumnActionFactory,
  CompositeColumnActionFactory,
];
