import { Field, ObjectType } from '@nestjs/graphql';

import { RelationMetadataInterface } from './relation-metadata.interface';
import { FieldMetadataInterface } from './field-metadata.interface';

@ObjectType()
export class ObjectMetadataInterface {
  @Field(() => String)
  id: string;

  @Field(() => String)
  nameSingular: string;

  @Field(() => String)
  namePlural: string;

  @Field(() => String)
  labelSingular: string;

  @Field(() => String)
  labelPlural: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String)
  targetTableName: string;

  @Field(() => [RelationMetadataInterface], { nullable: true })
  fromRelations: RelationMetadataInterface[];

  @Field(() => [RelationMetadataInterface], { nullable: true })
  toRelations: RelationMetadataInterface[];

  @Field(() => [FieldMetadataInterface])
  fields: FieldMetadataInterface[];

  @Field(() => Boolean)
  isSystem: boolean;

  @Field(() => Boolean)
  isCustom: boolean;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => Boolean)
  isRemote: boolean;

  @Field(() => Boolean)
  isAuditLogged: boolean;
}
