import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { UserCreateInput } from './user-create.input';
import { Type } from 'class-transformer';

@ArgsType()
export class CreateOneUserArgs {

    @Field(() => UserCreateInput, {nullable:false})
    @Type(() => UserCreateInput)
    data!: UserCreateInput;
}
