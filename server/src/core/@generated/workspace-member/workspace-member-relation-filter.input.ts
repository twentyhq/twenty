import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { WorkspaceMemberWhereInput } from './workspace-member-where.input';

@InputType()
export class WorkspaceMemberRelationFilter {
  @Field(() => WorkspaceMemberWhereInput, { nullable: true })
  is?: WorkspaceMemberWhereInput;

  @Field(() => WorkspaceMemberWhereInput, { nullable: true })
  isNot?: WorkspaceMemberWhereInput;
}
