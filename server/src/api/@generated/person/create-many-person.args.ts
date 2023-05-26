import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PersonCreateManyInput } from './person-create-many.input';
import { Type } from 'class-transformer';

@ArgsType()
export class CreateManyPersonArgs {

    @Field(() => [PersonCreateManyInput], {nullable:false})
    @Type(() => PersonCreateManyInput)
    data!: Array<PersonCreateManyInput>;

    @Field(() => Boolean, {nullable:true})
    skipDuplicates?: boolean;
}
