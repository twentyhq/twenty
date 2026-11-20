import { Field, ObjectType } from '@nestjs/graphql';
import { ViewKey, ViewType, ViewVisibility } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('MinimalView')
export class MinimalViewDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  universalIdentifier: string;

  @Field()
  name: string;

  @Field()
  icon: string;

  @Field(() => ViewType)
  type: ViewType;

  @Field(() => ViewKey, { nullable: true })
  key: ViewKey | null;

  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @Field()
  position: number;

  @Field(() => ViewVisibility)
  visibility: ViewVisibility;

  @Field()
  isActive: boolean;
}
