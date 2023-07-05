import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PersonCreateInput } from './person-create.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateOnePersonArgs {

    @Field(() => PersonCreateInput, {nullable:false})
    @Type(() => PersonCreateInput)
    @Type(() => PersonCreateInput)
    @ValidateNested({each: true})
    data!: PersonCreateInput;
}
