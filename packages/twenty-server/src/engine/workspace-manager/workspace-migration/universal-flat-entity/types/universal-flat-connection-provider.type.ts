import { type ApplicationOAuthProviderEntity } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.entity';
import { type UniversalFlatEntityFrom } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-from.type';

export type UniversalFlatConnectionProvider = UniversalFlatEntityFrom<
  ApplicationOAuthProviderEntity,
  'connectionProvider'
>;
