import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';

@InputType()
export class RefreshTokenWhereUniqueInput {

    @Field(() => String, {nullable:true})
    id?: string;
}
