import {
  Field,
  HideField,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { AggregateOperations } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type ViewFieldOverrides } from 'src/engine/metadata-modules/view-field/entities/view-field.entity';

registerEnumType(AggregateOperations, { name: 'AggregateOperations' });

@ObjectType('CoreViewField')
export class ViewFieldDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType, { nullable: false })
  fieldMetadataId: string;

  @Field({ nullable: false, defaultValue: true })
  isVisible: boolean;

  @Field({ nullable: false, defaultValue: 0 })
  size: number;

  @Field({ nullable: false, defaultValue: 0 })
  position: number;

  @Field(() => AggregateOperations, { nullable: true })
  aggregateOperation?: AggregateOperations | null;

  @Field(() => UUIDScalarType, { nullable: false })
  viewId: string;

  @Field(() => UUIDScalarType, { nullable: true })
  viewFieldGroupId?: string | null;

  @Field(() => UUIDScalarType, { nullable: false })
  workspaceId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;

  @Field(() => Boolean, { nullable: false })
  isOverridden: boolean;

  @HideField()
  overrides?: ViewFieldOverrides | null;
}
