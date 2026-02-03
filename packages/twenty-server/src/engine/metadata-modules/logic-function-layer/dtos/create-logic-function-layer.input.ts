import { ArgsType, Field } from '@nestjs/graphql';

import { IsString } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';

@ArgsType()
export class CreateLogicFunctionLayerInput {
  @Field(() => GraphQLJSON, { nullable: false })
  packageJsonChecksum: string;

  @IsString()
  @Field(() => String, { nullable: false })
  yarnLockChecksum: string;

  @Field(() => String)
  applicationUniversalIdentifier: string;
}
