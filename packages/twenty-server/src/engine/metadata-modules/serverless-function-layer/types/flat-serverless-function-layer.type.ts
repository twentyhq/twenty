import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type ServerlessFunctionLayerEntity } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.entity';

export type FlatServerlessFunctionLayer =
  FlatEntityFrom<ServerlessFunctionLayerEntity>;
