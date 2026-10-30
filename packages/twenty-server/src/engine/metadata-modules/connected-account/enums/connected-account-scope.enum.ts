import { registerEnumType } from '@nestjs/graphql';

import { type ConnectedAccountScope } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

export const ConnectedAccountScopeEnum = {
  USER: 'USER',
  WORKSPACE: 'WORKSPACE',
} as const satisfies { [P in ConnectedAccountScope]: P };

registerEnumType(ConnectedAccountScopeEnum, { name: 'ConnectedAccountScope' });
