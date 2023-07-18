import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { CommentWhereUniqueInput } from './comment-where-unique.input';
import { Type } from 'class-transformer';
import { CommentUpdateWithoutWorkspaceInput } from './comment-update-without-workspace.input';
import { HideField } from '@nestjs/graphql';
import { CommentCreateWithoutWorkspaceInput } from './comment-create-without-workspace.input';

@InputType()
export class CommentUpsertWithWhereUniqueWithoutWorkspaceInput {

    @Field(() => CommentWhereUniqueInput, {nullable:false})
    @Type(() => CommentWhereUniqueInput)
    where!: CommentWhereUniqueInput;

    @HideField()
    update!: CommentUpdateWithoutWorkspaceInput;

    @HideField()
    create!: CommentCreateWithoutWorkspaceInput;
}
