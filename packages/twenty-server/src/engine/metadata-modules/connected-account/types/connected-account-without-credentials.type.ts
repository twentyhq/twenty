import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

export type ConnectedAccountWithoutCredentials = Pick<
  ConnectedAccountEntity,
  | 'id'
  | 'handle'
  | 'handleAliases'
  | 'provider'
  | 'name'
  | 'visibility'
  | 'userWorkspaceId'
>;
