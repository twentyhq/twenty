import { type Sources } from 'twenty-shared/types';

import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';

export type FlatServerlessFunction =
  FlatEntityFrom<ServerlessFunctionEntity> & {
    code?: Sources;
  };
