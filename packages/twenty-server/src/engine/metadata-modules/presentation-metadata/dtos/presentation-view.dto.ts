import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { ViewKey, ViewType } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('PresentationView')
export class PresentationViewDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => ViewType)
  type: ViewType;

  @Field(() => ViewKey, { nullable: true })
  key: ViewKey | null;

  @Field(() => UUIDScalarType)
  objectMetadataId: string;
}
