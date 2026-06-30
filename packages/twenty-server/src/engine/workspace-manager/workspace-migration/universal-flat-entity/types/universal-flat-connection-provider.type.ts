import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatConnectionProvider = UniversalFlatEntityFrom<
  ConnectionProviderEntity,
  'connectionProvider'
>;
