import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutCommentsInput } from './user-create-without-comments.input';
import { HideField } from '@nestjs/graphql';
import { UserCreateOrConnectWithoutCommentsInput } from './user-create-or-connect-without-comments.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Type } from 'class-transformer';

@InputType()
export class UserCreateNestedOneWithoutCommentsInput {

    @HideField()
    create?: UserCreateWithoutCommentsInput;

    @HideField()
    connectOrCreate?: UserCreateOrConnectWithoutCommentsInput;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;
}
