import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';

@InputType()
export class CompanyWhereUniqueInput {

    @Field(() => String, {nullable:true})
    id?: string;
}
