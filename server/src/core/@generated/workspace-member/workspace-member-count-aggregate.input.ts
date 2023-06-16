import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';

@InputType()
export class WorkspaceMemberCountAggregateInput {

    @Field(() => Boolean, {nullable:true})
    id?: true;

    @Field(() => Boolean, {nullable:true})
    createdAt?: true;

    @Field(() => Boolean, {nullable:true})
    updatedAt?: true;

    @Field(() => Boolean, {nullable:true})
    deletedAt?: true;

    @Field(() => Boolean, {nullable:true})
    userId?: true;

    @HideField()
    workspaceId?: true;

    @Field(() => Boolean, {nullable:true})
    _all?: true;
}
