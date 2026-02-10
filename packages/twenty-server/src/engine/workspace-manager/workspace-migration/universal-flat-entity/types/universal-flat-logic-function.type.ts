import { type Sources } from 'twenty-shared/types';

import { type LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatLogicFunction = UniversalFlatEntityFrom<
  LogicFunctionEntity,
  'logicFunction'
> & {
  code?: Sources;
};
