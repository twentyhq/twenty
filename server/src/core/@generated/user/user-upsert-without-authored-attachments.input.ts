import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserUpdateWithoutAuthoredAttachmentsInput } from './user-update-without-authored-attachments.input';
import { Type } from 'class-transformer';
import { UserCreateWithoutAuthoredAttachmentsInput } from './user-create-without-authored-attachments.input';

@InputType()
export class UserUpsertWithoutAuthoredAttachmentsInput {

    @Field(() => UserUpdateWithoutAuthoredAttachmentsInput, {nullable:false})
    @Type(() => UserUpdateWithoutAuthoredAttachmentsInput)
    update!: UserUpdateWithoutAuthoredAttachmentsInput;

    @Field(() => UserCreateWithoutAuthoredAttachmentsInput, {nullable:false})
    @Type(() => UserCreateWithoutAuthoredAttachmentsInput)
    create!: UserCreateWithoutAuthoredAttachmentsInput;
}
