import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceMemberScalarWhereInput } from './workspace-member-scalar-where.input';
import { Type } from 'class-transformer';
import { WorkspaceMemberUpdateManyMutationInput } from './workspace-member-update-many-mutation.input';

@InputType()
export class WorkspaceMemberUpdateManyWithWhereWithoutWorkspaceInput {
  @Field(() => WorkspaceMemberScalarWhereInput, { nullable: false })
  @Type(() => WorkspaceMemberScalarWhereInput)
  where!: WorkspaceMemberScalarWhereInput;

  @Field(() => WorkspaceMemberUpdateManyMutationInput, { nullable: false })
  @Type(() => WorkspaceMemberUpdateManyMutationInput)
  data!: WorkspaceMemberUpdateManyMutationInput;
}
