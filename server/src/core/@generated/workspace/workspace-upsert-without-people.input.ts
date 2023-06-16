import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceUpdateWithoutPeopleInput } from './workspace-update-without-people.input';
import { Type } from 'class-transformer';
import { WorkspaceCreateWithoutPeopleInput } from './workspace-create-without-people.input';

@InputType()
export class WorkspaceUpsertWithoutPeopleInput {
  @Field(() => WorkspaceUpdateWithoutPeopleInput, { nullable: false })
  @Type(() => WorkspaceUpdateWithoutPeopleInput)
  update!: WorkspaceUpdateWithoutPeopleInput;

  @Field(() => WorkspaceCreateWithoutPeopleInput, { nullable: false })
  @Type(() => WorkspaceCreateWithoutPeopleInput)
  create!: WorkspaceCreateWithoutPeopleInput;
}
