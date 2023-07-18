import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentWhereInput } from './attachment-where.input';

@InputType()
export class AttachmentListRelationFilter {

    @Field(() => AttachmentWhereInput, {nullable:true})
    every?: AttachmentWhereInput;

    @Field(() => AttachmentWhereInput, {nullable:true})
    some?: AttachmentWhereInput;

    @Field(() => AttachmentWhereInput, {nullable:true})
    none?: AttachmentWhereInput;
}
