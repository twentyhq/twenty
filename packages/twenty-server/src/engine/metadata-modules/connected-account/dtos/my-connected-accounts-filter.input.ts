import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

import { type ConnectedAccountScope } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountScopeEnum } from 'src/engine/metadata-modules/connected-account/enums/connected-account-scope.enum';

@InputType('MyConnectedAccountsFilterInput')
export class MyConnectedAccountsFilterInput {
  @IsBoolean()
  @IsOptional()
  @Field(() => Boolean, {
    nullable: true,
    description:
      'true keeps only the accounts the caller owns; false, null or omitted also keeps the workspace-shared accounts of other members',
  })
  ownedByCaller?: boolean | null;

  @IsEnum(ConnectedAccountScopeEnum)
  @IsOptional()
  @Field(() => ConnectedAccountScopeEnum, {
    nullable: true,
    description:
      'Keeps only the app connections with this scope; accounts from other providers are not affected',
  })
  appConnectionScope?: ConnectedAccountScope | null;
}
