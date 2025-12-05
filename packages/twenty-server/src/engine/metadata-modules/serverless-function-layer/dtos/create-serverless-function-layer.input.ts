import { ArgsType, Field } from '@nestjs/graphql';

import { IsString } from 'class-validator';
import GraphQLJSON from 'graphql-type-json';
import { PackageJson } from 'twenty-shared/application';

@ArgsType()
export class CreateServerlessFunctionLayerInput {
  @Field(() => GraphQLJSON, { nullable: false })
  packageJson: PackageJson;

  @IsString()
  @Field(() => String, { nullable: false })
  yarnLock: string;
}
