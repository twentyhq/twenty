import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type ConnectedAccountWithoutCredentials } from 'src/engine/metadata-modules/connected-account/types/connected-account-without-credentials.type';

export type ConnectedAccountUsableByCaller =
  ConnectedAccountWithoutCredentials &
    Pick<ConnectedAccountEntity, 'connectionParameters'>;
