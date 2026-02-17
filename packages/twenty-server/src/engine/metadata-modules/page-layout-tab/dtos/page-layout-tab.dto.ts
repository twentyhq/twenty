import { Field, Float, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PageLayoutWidgetDTO } from 'src/engine/metadata-modules/page-layout-widget/dtos/page-layout-widget.dto';

registerEnumType(PageLayoutTabLayoutMode, {
  name: 'PageLayoutTabLayoutMode',
});

@ObjectType('PageLayoutTab')
export class PageLayoutTabDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType, { nullable: false })
  applicationId: string;

  @Field({ nullable: false })
  title: string;

  @Field(() => Float, { nullable: false, defaultValue: 0 })
  position: number;

  @Field(() => UUIDScalarType, { nullable: false })
  pageLayoutId: string;

  @Field(() => [PageLayoutWidgetDTO], { nullable: true })
  widgets?: PageLayoutWidgetDTO[] | null;

  @Field(() => String, { nullable: true })
  icon?: string | null;

  @Field(() => PageLayoutTabLayoutMode, {
    nullable: true, // Not nullable in the database, but we need to make it nullable here until the frontend consumes the new type
    defaultValue: PageLayoutTabLayoutMode.GRID,
  })
  layoutMode: PageLayoutTabLayoutMode;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;
}
