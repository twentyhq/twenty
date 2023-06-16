import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { PersonScalarWhereInput } from './person-scalar-where.input';
import { Type } from 'class-transformer';
import { PersonUpdateManyMutationInput } from './person-update-many-mutation.input';

@InputType()
export class PersonUpdateManyWithWhereWithoutWorkspaceInput {

    @Field(() => PersonScalarWhereInput, {nullable:false})
    @Type(() => PersonScalarWhereInput)
    where!: PersonScalarWhereInput;

    @Field(() => PersonUpdateManyMutationInput, {nullable:false})
    @Type(() => PersonUpdateManyMutationInput)
    data!: PersonUpdateManyMutationInput;
}
