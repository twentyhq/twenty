import { Field } from '@nestjs/graphql';
import { InputType } from '@nestjs/graphql';
import { AttachmentType } from './attachment-type.enum';
import { NestedIntFilter } from './nested-int-filter.input';
import { NestedEnumAttachmentTypeFilter } from './nested-enum-attachment-type-filter.input';

@InputType()
export class NestedEnumAttachmentTypeWithAggregatesFilter {

    @Field(() => AttachmentType, {nullable:true})
    equals?: keyof typeof AttachmentType;

    @Field(() => [AttachmentType], {nullable:true})
    in?: Array<keyof typeof AttachmentType>;

    @Field(() => [AttachmentType], {nullable:true})
    notIn?: Array<keyof typeof AttachmentType>;

    @Field(() => NestedEnumAttachmentTypeWithAggregatesFilter, {nullable:true})
    not?: NestedEnumAttachmentTypeWithAggregatesFilter;

    @Field(() => NestedIntFilter, {nullable:true})
    _count?: NestedIntFilter;

    @Field(() => NestedEnumAttachmentTypeFilter, {nullable:true})
    _min?: NestedEnumAttachmentTypeFilter;

    @Field(() => NestedEnumAttachmentTypeFilter, {nullable:true})
    _max?: NestedEnumAttachmentTypeFilter;
}
