import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PageLayoutTabDTO } from 'src/engine/metadata-modules/page-layout-tab/dtos/page-layout-tab.dto';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

registerEnumType(PageLayoutType, { name: 'PageLayoutType' });

@ObjectType('PageLayout')
export class PageLayoutDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field({ nullable: false })
  name: string;

  @Field(() => PageLayoutType, {
    nullable: false,
    defaultValue: PageLayoutType.RECORD_PAGE,
  })
  type: PageLayoutType;

  @Field(() => UUIDScalarType, { nullable: true })
  objectMetadataId?: string | null;

  @Field(() => [PageLayoutTabDTO], { nullable: true })
  tabs?: PageLayoutTabDTO[] | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;
}
