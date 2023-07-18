import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Type } from 'class-transformer';
import { UserCreateWithoutAuthoredAttachmentsInput } from './user-create-without-authored-attachments.input';
import { HideField } from '@nestjs/graphql';

@InputType()
export class UserCreateOrConnectWithoutAuthoredAttachmentsInput {

    @Field(() => UserWhereUniqueInput, {nullable:false})
    @Type(() => UserWhereUniqueInput)
    where!: UserWhereUniqueInput;

    @HideField()
    create!: UserCreateWithoutAuthoredAttachmentsInput;
}
