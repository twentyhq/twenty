import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentScalarWhereInput } from './attachment-scalar-where.input';
import { Type } from 'class-transformer';
import { AttachmentUpdateManyMutationInput } from './attachment-update-many-mutation.input';

@InputType()
export class AttachmentUpdateManyWithWhereWithoutActivityInput {

    @Field(() => AttachmentScalarWhereInput, {nullable:false})
    @Type(() => AttachmentScalarWhereInput)
    where!: AttachmentScalarWhereInput;

    @Field(() => AttachmentUpdateManyMutationInput, {nullable:false})
    @Type(() => AttachmentUpdateManyMutationInput)
    data!: AttachmentUpdateManyMutationInput;
}
