import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('MinimalObjectMetadata')
export class MinimalObjectMetadataDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field()
  nameSingular: string;

  @Field()
  namePlural: string;

  @Field()
  labelSingular: string;

  @Field()
  labelPlural: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  color?: string;

  @Field()
  isActive: boolean;

  @Field()
  isSystem: boolean;

  @Field()
  isRemote: boolean;
}
