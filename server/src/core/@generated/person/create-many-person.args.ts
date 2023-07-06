import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PersonCreateManyInput } from './person-create-many.input';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

@ArgsType()
export class CreateManyPersonArgs {

    @Field(() => [PersonCreateManyInput], {nullable:false})
    @Type(() => PersonCreateManyInput)
    @ValidateNested({each: true})
    @Type(() => PersonCreateManyInput)
    data!: Array<PersonCreateManyInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
