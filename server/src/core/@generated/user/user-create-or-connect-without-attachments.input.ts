import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Type } from 'class-transformer';
import { UserCreateWithoutAttachmentsInput } from './user-create-without-attachments.input';

@InputType()
export class UserCreateOrConnectWithoutAttachmentsInput {

    @Field(() => UserWhereUniqueInput, {nullable:false})
    @Type(() => UserWhereUniqueInput)
    where!: UserWhereUniqueInput;

    @Field(() => UserCreateWithoutAttachmentsInput, {nullable:false})
    @Type(() => UserCreateWithoutAttachmentsInput)
    create!: UserCreateWithoutAttachmentsInput;
}
