import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonWhereUniqueInput } from './person-where-unique.input';
import { Type } from 'class-transformer';
import { PersonUpdateWithoutWorkspaceInput } from './person-update-without-workspace.input';

@InputType()
export class PersonUpdateWithWhereUniqueWithoutWorkspaceInput {

    @Field(() => PersonWhereUniqueInput, {nullable:false})
    @Type(() => PersonWhereUniqueInput)
    where!: PersonWhereUniqueInput;

    @Field(() => PersonUpdateWithoutWorkspaceInput, {nullable:false})
    @Type(() => PersonUpdateWithoutWorkspaceInput)
    data!: PersonUpdateWithoutWorkspaceInput;
}
