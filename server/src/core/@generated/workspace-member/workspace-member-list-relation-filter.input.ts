import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceMemberWhereInput } from './workspace-member-where.input';

@InputType()
export class WorkspaceMemberListRelationFilter {
  @Field(() => WorkspaceMemberWhereInput, { nullable: true })
  every?: WorkspaceMemberWhereInput;

  @Field(() => WorkspaceMemberWhereInput, { nullable: true })
  some?: WorkspaceMemberWhereInput;

  @Field(() => WorkspaceMemberWhereInput, { nullable: true })
  none?: WorkspaceMemberWhereInput;
}
