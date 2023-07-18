import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { ColorScheme } from './color-scheme.enum';

@InputType()
export class EnumColorSchemeFieldUpdateOperationsInput {

    @Field(() => ColorScheme, {nullable:true})
    set?: keyof typeof ColorScheme;
}
