import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentWhereUniqueInput } from './comment-where-unique.input';
import { Type } from 'class-transformer';
import { CommentCreateWithoutWorkspaceInput } from './comment-create-without-workspace.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class CommentCreateOrConnectWithoutWorkspaceInput {

    @Field(() => CommentWhereUniqueInput, {nullable:false})
    @Type(() => CommentWhereUniqueInput)
    where!: CommentWhereUniqueInput;

    @HideField()
    create!: CommentCreateWithoutWorkspaceInput;
}
