import { Field, InputType } from '@nestjs/graphql';

import { IsBoolean, IsIn, IsOptional } from 'class-validator';

import { type ConnectedAccountVisibility } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

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

  @IsIn(['user', 'workspace'])
  @IsOptional()
  @Field(() => String, {
    nullable: true,
    description:
      'Keeps only the app connections with this visibility; accounts from other providers are not affected',
  })
  appConnectionVisibility?: ConnectedAccountVisibility | null;
}
