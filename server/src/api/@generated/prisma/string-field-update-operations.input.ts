import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';

@InputType()
export class StringFieldUpdateOperationsInput {

    @Field(() => String, {nullable:true})
    set?: string;
}
