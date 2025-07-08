import { BasicColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/factories/basic-column-action.factory';
import { CompositeColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';
import { EnumColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/factories/enum-column-action.factory';
import { MorphRelationColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/factories/morph-relation-column-action.factory';
import { RelationColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/factories/relation-column-action.factory';
import { TsVectorColumnActionFactory } from 'src/engine/metadata-modules/workspace-migration/factories/ts-vector-column-action.factory';

export const workspaceColumnActionFactories = [
  TsVectorColumnActionFactory,
  BasicColumnActionFactory,
  EnumColumnActionFactory,
  CompositeColumnActionFactory,
  RelationColumnActionFactory,
  MorphRelationColumnActionFactory,
];
