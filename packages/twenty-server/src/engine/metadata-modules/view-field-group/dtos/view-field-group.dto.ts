import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewFieldDTO } from 'src/engine/metadata-modules/view-field/dtos/view-field.dto';

@ObjectType('CoreViewFieldGroup')
export class ViewFieldGroupDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field({ nullable: false })
  name: string;

  @Field({ nullable: false, defaultValue: 0 })
  position: number;

  @Field({ nullable: false, defaultValue: true })
  isVisible: boolean;

  @Field(() => UUIDScalarType, { nullable: false })
  viewId: string;

  @Field(() => UUIDScalarType, { nullable: false })
  workspaceId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;

  @Field(() => [ViewFieldDTO])
  viewFields?: ViewFieldDTO[];
}
