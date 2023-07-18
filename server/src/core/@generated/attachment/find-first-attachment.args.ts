import { Field } from '@nestjs/graphql';
import { ArgsType } from '@nestjs/graphql';
import { AttachmentWhereInput } from './attachment-where.input';
import { Type } from 'class-transformer';
import { AttachmentOrderByWithRelationInput } from './attachment-order-by-with-relation.input';
import { AttachmentWhereUniqueInput } from './attachment-where-unique.input';
import { Int } from '@nestjs/graphql';
import { AttachmentScalarFieldEnum } from './attachment-scalar-field.enum';

@ArgsType()
export class FindFirstAttachmentArgs {

    @Field(() => AttachmentWhereInput, {nullable:true})
    @Type(() => AttachmentWhereInput)
    where?: AttachmentWhereInput;

    @Field(() => [AttachmentOrderByWithRelationInput], {nullable:true})
    orderBy?: Array<AttachmentOrderByWithRelationInput>;

    @Field(() => AttachmentWhereUniqueInput, {nullable:true})
    cursor?: AttachmentWhereUniqueInput;

    @Field(() => Int, {nullable:true})
    take?: number;

    @Field(() => Int, {nullable:true})
    skip?: number;

    @Field(() => [AttachmentScalarFieldEnum], {nullable:true})
    distinct?: Array<keyof typeof AttachmentScalarFieldEnum>;
}
