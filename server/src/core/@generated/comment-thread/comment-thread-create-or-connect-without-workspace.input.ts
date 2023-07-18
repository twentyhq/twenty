import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentThreadWhereUniqueInput } from './comment-thread-where-unique.input';
import { Type } from 'class-transformer';
import { CommentThreadCreateWithoutWorkspaceInput } from './comment-thread-create-without-workspace.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class CommentThreadCreateOrConnectWithoutWorkspaceInput {

    @Field(() => CommentThreadWhereUniqueInput, {nullable:false})
    @Type(() => CommentThreadWhereUniqueInput)
    where!: CommentThreadWhereUniqueInput;

    @HideField()
    create!: CommentThreadCreateWithoutWorkspaceInput;
}
