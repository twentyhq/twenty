import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { PersonWhereUniqueInput } from './person-where-unique.input';
import { Type } from 'class-transformer';
import { PersonCreateInput } from './person-create.input';
import { HideField } from '@nestjs/graphql';
import { PersonUpdateInput } from './person-update.input';

@ArgsType()
export class UpsertOnePersonArgs {

    @Field(() => PersonWhereUniqueInput, {nullable:false})
    @Type(() => PersonWhereUniqueInput)
    where!: PersonWhereUniqueInput;

    @HideField()
    create!: PersonCreateInput;

    @HideField()
    update!: PersonUpdateInput;
}
