import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceCreateOrConnectWithoutPeopleInput } from './WorkspaceCreateOrConnectWithoutPeopleInput';
import { WorkspaceCreateWithoutPeopleInput } from './WorkspaceCreateWithoutPeopleInput';
import { WorkspaceUpdateWithoutPeopleInput } from './WorkspaceUpdateWithoutPeopleInput';
import { WorkspaceUpsertWithoutPeopleInput } from './WorkspaceUpsertWithoutPeopleInput';
import { WorkspaceWhereUniqueInput } from './WorkspaceWhereUniqueInput';

@TypeGraphQL.InputType('WorkspaceUpdateOneRequiredWithoutPeopleNestedInput', {
  isAbstract: true,
})
export class WorkspaceUpdateOneRequiredWithoutPeopleNestedInput {
  @TypeGraphQL.Field((_type) => WorkspaceCreateWithoutPeopleInput, {
    nullable: true,
  })
  create?: WorkspaceCreateWithoutPeopleInput | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceCreateOrConnectWithoutPeopleInput, {
    nullable: true,
  })
  connectOrCreate?: WorkspaceCreateOrConnectWithoutPeopleInput | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceUpsertWithoutPeopleInput, {
    nullable: true,
  })
  upsert?: WorkspaceUpsertWithoutPeopleInput | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceWhereUniqueInput, {
    nullable: true,
  })
  connect?: WorkspaceWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => WorkspaceUpdateWithoutPeopleInput, {
    nullable: true,
  })
  update?: WorkspaceUpdateWithoutPeopleInput | undefined;
}
