import { Field, Float, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';

@ObjectType('PageLayoutTab')
export class PageLayoutTabEntity {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field({ nullable: false })
  title: string;

  @Field(() => Float, { nullable: false, defaultValue: 0 })
  position: number;

  @Field(() => UUIDScalarType, { nullable: false })
  pageLayoutId: string;

  @Field(() => [PageLayoutWidgetEntity], { nullable: true })
  widgets?: PageLayoutWidgetEntity[] | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;
}
