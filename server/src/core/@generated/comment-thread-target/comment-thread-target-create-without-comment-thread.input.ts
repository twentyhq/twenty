import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { CommentableType } from '../prisma/commentable-type.enum';
import { HideField } from '@nestjs/graphql';

@InputType()
export class CommentThreadTargetCreateWithoutCommentThreadInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => CommentableType, {nullable:false})
    commentableType!: keyof typeof CommentableType;

    @Field(() => String, {nullable:false})
    commentableId!: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;
}
