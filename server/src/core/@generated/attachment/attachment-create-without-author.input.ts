import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { AttachmentType } from '../prisma/attachment-type.enum';
import { HideField } from '@nestjs/graphql';
import { CommentThreadCreateNestedOneWithoutAttachmentsInput } from '../comment-thread/comment-thread-create-nested-one-without-attachments.input';

@InputType()
export class AttachmentCreateWithoutAuthorInput {

    @Field(() => String, {nullable:true})
    @Validator.IsString()
    @Validator.IsOptional()
    id?: string;

    @Field(() => String, {nullable:false})
    fullPath!: string;

    @Field(() => AttachmentType, {nullable:false})
    type!: keyof typeof AttachmentType;

    @Field(() => String, {nullable:false})
    name!: string;

    @HideField()
    workspaceId!: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;

    @Field(() => CommentThreadCreateNestedOneWithoutAttachmentsInput, {nullable:false})
    activity!: CommentThreadCreateNestedOneWithoutAttachmentsInput;
}
