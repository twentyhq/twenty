import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';

@InputType()
export class BoolFieldUpdateOperationsInput {

    @Field(() => Boolean, {nullable:true})
    set?: boolean;
}
