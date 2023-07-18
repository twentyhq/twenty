import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { UserCreateWithoutCommentsInput } from './user-create-without-comments.input';
import { HideField } from '@nestjs/graphql';
import { UserCreateOrConnectWithoutCommentsInput } from './user-create-or-connect-without-comments.input';
import { UserUpsertWithoutCommentsInput } from './user-upsert-without-comments.input';
import { UserWhereUniqueInput } from './user-where-unique.input';
import { Type } from 'class-transformer';
import { UserUpdateWithoutCommentsInput } from './user-update-without-comments.input';

@InputType()
export class UserUpdateOneRequiredWithoutCommentsNestedInput {

    @HideField()
    create?: UserCreateWithoutCommentsInput;

    @HideField()
    connectOrCreate?: UserCreateOrConnectWithoutCommentsInput;

    @HideField()
    upsert?: UserUpsertWithoutCommentsInput;

    @Field(() => UserWhereUniqueInput, {nullable:true})
    @Type(() => UserWhereUniqueInput)
    connect?: UserWhereUniqueInput;

    @HideField()
    update?: UserUpdateWithoutCommentsInput;
}
