import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { ActivityType } from './activity-type.enum';

@InputType()
export class EnumActivityTypeFieldUpdateOperationsInput {

    @Field(() => ActivityType, {nullable:true})
    set?: keyof typeof ActivityType;
}
