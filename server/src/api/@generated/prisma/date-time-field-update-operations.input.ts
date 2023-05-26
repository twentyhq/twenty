import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';

@InputType()
export class DateTimeFieldUpdateOperationsInput {

    @Field(() => Date, {nullable:true})
    set?: Date | string;
}
