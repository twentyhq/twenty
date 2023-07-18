import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserUpdateWithoutAttachmentsInput } from './user-update-without-attachments.input';
import { Type } from 'class-transformer';
import { UserCreateWithoutAttachmentsInput } from './user-create-without-attachments.input';

@InputType()
export class UserUpsertWithoutAttachmentsInput {

    @Field(() => UserUpdateWithoutAttachmentsInput, {nullable:false})
    @Type(() => UserUpdateWithoutAttachmentsInput)
    update!: UserUpdateWithoutAttachmentsInput;

    @Field(() => UserCreateWithoutAttachmentsInput, {nullable:false})
    @Type(() => UserCreateWithoutAttachmentsInput)
    create!: UserCreateWithoutAttachmentsInput;
}
