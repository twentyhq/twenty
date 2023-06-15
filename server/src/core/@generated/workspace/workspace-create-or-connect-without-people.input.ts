import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceWhereUniqueInput } from './workspace-where-unique.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateWithoutPeopleInput } from './workspace-create-without-people.input';

@InputType()
export class WorkspaceCreateOrConnectWithoutPeopleInput {
  @Field(() => WorkspaceWhereUniqueInput, { nullable: false })
  @Type(() => WorkspaceWhereUniqueInput)
  where!: WorkspaceWhereUniqueInput;

  @Field(() => WorkspaceCreateWithoutPeopleInput, { nullable: false })
  @Type(() => WorkspaceCreateWithoutPeopleInput)
  create!: WorkspaceCreateWithoutPeopleInput;
}
