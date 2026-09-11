import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type ConnectedAccountWithoutCredentials } from 'src/engine/metadata-modules/connected-account/types/connected-account-without-credentials.type';

// connectionParameters decides whether an imap account can actually send or draft,
// so callers that filter on capability need it. It holds encrypted secrets and must
// stay server-side: never map it into a tool result or a GraphQL DTO.
export type ConnectedAccountUsableByCaller =
  ConnectedAccountWithoutCredentials &
    Pick<ConnectedAccountEntity, 'connectionParameters'>;
