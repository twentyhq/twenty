import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceCreateWithoutPeopleInput } from './workspace-create-without-people.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateOrConnectWithoutPeopleInput } from './workspace-create-or-connect-without-people.input';
import { WorkspaceUpsertWithoutPeopleInput } from './workspace-upsert-without-people.input';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { WorkspaceUpdateWithoutPeopleInput } from './workspace-update-without-people.input';

@InputType()
export class WorkspaceUpdateOneRequiredWithoutPeopleNestedInput {
  @Field(() => WorkspaceCreateWithoutPeopleInput, { nullable: true })
  @Type(() => WorkspaceCreateWithoutPeopleInput)
  create?: WorkspaceCreateWithoutPeopleInput;

  @Field(() => WorkspaceCreateOrConnectWithoutPeopleInput, { nullable: true })
  @Type(() => WorkspaceCreateOrConnectWithoutPeopleInput)
  connectOrCreate?: WorkspaceCreateOrConnectWithoutPeopleInput;

  @Field(() => WorkspaceUpsertWithoutPeopleInput, { nullable: true })
  @Type(() => WorkspaceUpsertWithoutPeopleInput)
  upsert?: WorkspaceUpsertWithoutPeopleInput;

  @Field(() => WorkspaceWhereUniqueInput, { nullable: true })
  @Type(() => WorkspaceWhereUniqueInput)
  connect?: WorkspaceWhereUniqueInput;

  @Field(() => WorkspaceUpdateWithoutPeopleInput, { nullable: true })
  @Type(() => WorkspaceUpdateWithoutPeopleInput)
  update?: WorkspaceUpdateWithoutPeopleInput;
}
