import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

@ObjectType('ObjectRecordEventProperties')
export class ObjectRecordEventPropertiesDTO {
  @Field(() => [String], { nullable: true })
  updatedFields?: string[];

  @Field(() => GraphQLJSON, { nullable: true })
  before?: object;

  @Field(() => GraphQLJSON, { nullable: true })
  after?: object;

  @Field(() => GraphQLJSON, { nullable: true })
  diff?: object;
}

@ObjectType('ObjectRecordEvent')
export class ObjectRecordEventDTO {
  @Field(() => String)
  objectNameSingular: string;

  @Field(() => String)
  recordId: string;

  @Field(() => String, { nullable: true })
  userId?: string;

  @Field(() => String, { nullable: true })
  workspaceMemberId?: string;

  @Field(() => ObjectRecordEventPropertiesDTO)
  properties: ObjectRecordEventPropertiesDTO;
}
