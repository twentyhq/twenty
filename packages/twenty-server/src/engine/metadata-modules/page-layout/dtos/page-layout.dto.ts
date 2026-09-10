import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { PageLayoutType, SerializedRelation } from 'twenty-shared/types';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { PageLayoutTabDTO } from 'src/engine/metadata-modules/page-layout-tab/dtos/page-layout-tab.dto';

registerEnumType(PageLayoutType, { name: 'PageLayoutType' });

@ObjectType('PageLayout')
export class PageLayoutDTO {
  @Field(() => UUIDScalarType)
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

  @Field(() => UUIDScalarType, { nullable: true })
  defaultTabToFocusOnMobileAndSidePanelId?: SerializedRelation;

  @Field(() => UUIDScalarType, { nullable: false })
  universalIdentifier: string;

  @Field(() => UUIDScalarType, { nullable: false })
  applicationId: string;

  @Field({ nullable: false })
  isSystemSideEffect: boolean;

  @Field({ nullable: false, defaultValue: true })
  isFirstTabPinned: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;
}
