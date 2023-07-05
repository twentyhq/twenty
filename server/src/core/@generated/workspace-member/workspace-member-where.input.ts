import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { StringFilter } from '../prisma/string-filter.input';
import { HideField } from '@nestjs/graphql';
import { DateTimeNullableFilter } from '../prisma/date-time-nullable-filter.input';
import { DateTimeFilter } from '../prisma/date-time-filter.input';
import { UserRelationFilter } from '../user/user-relation-filter.input';
import { WorkspaceRelationFilter } from '../workspace/workspace-relation-filter.input';

@InputType()
export class WorkspaceMemberWhereInput {

    @Field(() => [WorkspaceMemberWhereInput], {nullable:true})
    AND?: Array<WorkspaceMemberWhereInput>;

    @Field(() => [WorkspaceMemberWhereInput], {nullable:true})
    OR?: Array<WorkspaceMemberWhereInput>;

    @Field(() => [WorkspaceMemberWhereInput], {nullable:true})
    NOT?: Array<WorkspaceMemberWhereInput>;

    @Field(() => StringFilter, {nullable:true})
    id?: StringFilter;

    @Field(() => StringFilter, {nullable:true})
    userId?: StringFilter;

    @HideField()
    workspaceId?: StringFilter;

    @HideField()
    deletedAt?: DateTimeNullableFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    createdAt?: DateTimeFilter;

    @Field(() => DateTimeFilter, {nullable:true})
    updatedAt?: DateTimeFilter;

    @Field(() => UserRelationFilter, {nullable:true})
    user?: UserRelationFilter;

    @HideField()
    workspace?: WorkspaceRelationFilter;
}
