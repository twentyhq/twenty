import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

registerEnumType(PageLayoutType, { name: 'PageLayoutType' });

@ObjectType('PageLayout')
export class PageLayoutEntity {
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

  @Field(() => [PageLayoutTabEntity], { nullable: true })
  tabs?: PageLayoutTabEntity[] | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;
}
