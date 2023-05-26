import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { WorkspaceMemberWhereInput } from './workspace-member-where.input';
import { Type } from 'class-transformer';
import { WorkspaceMemberOrderByWithRelationInput } from './workspace-member-order-by-with-relation.input';
import { WorkspaceMemberWhereUniqueInput } from './workspace-member-where-unique.input';
import { Int } from '@nestjs/graphql';
import { WorkspaceMemberScalarFieldEnum } from './workspace-member-scalar-field.enum';

@ArgsType()
export class FindFirstWorkspaceMemberOrThrowArgs {

    @Field(() => WorkspaceMemberWhereInput, {nullable:true})
    @Type(() => WorkspaceMemberWhereInput)
    where?: WorkspaceMemberWhereInput;

    @Field(() => [WorkspaceMemberOrderByWithRelationInput], {nullable:true})
    orderBy?: Array<WorkspaceMemberOrderByWithRelationInput>;

    @Field(() => WorkspaceMemberWhereUniqueInput, {nullable:true})
    cursor?: WorkspaceMemberWhereUniqueInput;

    @Field(() => Int, {nullable:true})
    take?: number;

    @Field(() => Int, {nullable:true})
    skip?: number;

    @Field(() => [WorkspaceMemberScalarFieldEnum], {nullable:true})
    distinct?: Array<keyof typeof WorkspaceMemberScalarFieldEnum>;
}
