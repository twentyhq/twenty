import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { HideField } from '@nestjs/graphql';

@InputType()
export class CommentUncheckedCreateInput {

    @Field(() => String, {nullable:false})
    id!: string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    deletedAt?: Date | string;

    @Field(() => String, {nullable:false})
    body!: string;

    @Field(() => String, {nullable:false})
    authorId!: string;

    @Field(() => String, {nullable:false})
    commentThreadId!: string;

    @HideField()
    workspaceId!: string;
}
