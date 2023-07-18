import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserUpdateWithoutAuthoredAttachmentsInput } from './user-update-without-authored-attachments.input';
import { HideField } from '@nestjs/graphql';
import { UserCreateWithoutAuthoredAttachmentsInput } from './user-create-without-authored-attachments.input';

@InputType()
export class UserUpsertWithoutAuthoredAttachmentsInput {

    @HideField()
    update!: UserUpdateWithoutAuthoredAttachmentsInput;

    @HideField()
    create!: UserCreateWithoutAuthoredAttachmentsInput;
}
