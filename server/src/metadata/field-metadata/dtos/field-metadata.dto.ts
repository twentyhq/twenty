import {
  Field,
  HideField,
  ID,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import {
  Authorize,
  FilterableField,
  IDField,
  QueryOptions,
  Relation,
} from '@ptc-org/nestjs-query-graphql';

import { RelationMetadataDTO } from 'src/metadata/relation-metadata/dtos/relation-metadata.dto';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

registerEnumType(FieldMetadataType, {
  name: 'FieldMetadataType',
  description: 'Type of the field',
});

@ObjectType('field')
@Authorize({
  authorize: (context: any) => ({
    workspaceId: { eq: context?.req?.user?.workspace?.id },
  }),
})
@QueryOptions({
  defaultResultSize: 10,
  disableSort: true,
  maxResultsSize: 1000,
})
@Relation('toRelationMetadata', () => RelationMetadataDTO, {
  nullable: true,
})
@Relation('fromRelationMetadata', () => RelationMetadataDTO, {
  nullable: true,
})
export class FieldMetadataDTO {
  @IDField(() => ID)
  id: string;

  @Field(() => FieldMetadataType)
  type: FieldMetadataType;

  @Field()
  name: string;

  @Field()
  label: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  icon: string;

  @Field({ nullable: true, deprecationReason: 'Use label name instead' })
  placeholder?: string;

  @FilterableField()
  isCustom: boolean;

  @FilterableField()
  isActive: boolean;

  @FilterableField()
  isSystem: boolean;

  @Field()
  isNullable: boolean;

  @HideField()
  workspaceId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
