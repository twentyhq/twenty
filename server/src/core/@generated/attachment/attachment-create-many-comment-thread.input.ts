import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import * as Validator from 'class-validator';
import { AttachmentType } from '../prisma/attachment-type.enum';
import { HideField } from '@nestjs/graphql';

@InputType()
export class AttachmentCreateManyCommentThreadInput {

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

    @Field(() => String, {nullable:false})
    authorId!: string;

    @HideField()
    workspaceId!: string;

    @HideField()
    deletedAt?: Date | string;

    @Field(() => Date, {nullable:true})
    createdAt?: Date | string;

    @Field(() => Date, {nullable:true})
    updatedAt?: Date | string;
}
