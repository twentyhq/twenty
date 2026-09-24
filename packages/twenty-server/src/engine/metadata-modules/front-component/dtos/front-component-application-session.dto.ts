import { Field, ObjectType } from '@nestjs/graphql';

import { GraphQLJSON } from 'graphql-type-json';

import { ApplicationTokenPairDTO } from 'src/engine/core-modules/application/application-oauth/dtos/application-token-pair.dto';

@ObjectType('FrontComponentApplicationSession')
export class FrontComponentApplicationSessionDTO {
  @Field(() => ApplicationTokenPairDTO)
  applicationTokenPair: ApplicationTokenPairDTO;

  @Field(() => GraphQLJSON)
  applicationVariables: Record<string, string>;
}
