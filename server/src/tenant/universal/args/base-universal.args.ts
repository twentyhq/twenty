import { ArgsType, Field } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class BaseUniversalArgs {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  entity: string;
}
