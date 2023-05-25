import * as TypeGraphQL from '@nestjs/graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { WorkspaceCreateOrConnectWithoutPeopleInput } from '../inputs/WorkspaceCreateOrConnectWithoutPeopleInput';
import { WorkspaceCreateWithoutPeopleInput } from '../inputs/WorkspaceCreateWithoutPeopleInput';
import { WorkspaceUpdateWithoutPeopleInput } from '../inputs/WorkspaceUpdateWithoutPeopleInput';
import { WorkspaceUpsertWithoutPeopleInput } from '../inputs/WorkspaceUpsertWithoutPeopleInput';
import { WorkspaceWhereUniqueInput } from '../inputs/WorkspaceWhereUniqueInput';

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
