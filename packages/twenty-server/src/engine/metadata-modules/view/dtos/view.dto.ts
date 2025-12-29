import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ViewFieldDTO } from 'src/engine/metadata-modules/view-field/dtos/view-field.dto';
import { ViewFilterGroupDTO } from 'src/engine/metadata-modules/view-filter-group/dtos/view-filter-group.dto';
import { ViewFilterDTO } from 'src/engine/metadata-modules/view-filter/dtos/view-filter.dto';
import { ViewGroupDTO } from 'src/engine/metadata-modules/view-group/dtos/view-group.dto';
import { ViewSortDTO } from 'src/engine/metadata-modules/view-sort/dtos/view-sort.dto';
import { ViewCalendarLayout } from 'src/engine/metadata-modules/view/enums/view-calendar-layout.enum';
import { ViewKey } from 'src/engine/metadata-modules/view/enums/view-key.enum';
import { ViewOpenRecordIn } from 'src/engine/metadata-modules/view/enums/view-open-record-in';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import { ViewVisibility } from 'src/engine/metadata-modules/view/enums/view-visibility.enum';

registerEnumType(ViewOpenRecordIn, { name: 'ViewOpenRecordIn' });
registerEnumType(ViewType, { name: 'ViewType' });
registerEnumType(ViewKey, { name: 'ViewKey' });
registerEnumType(ViewCalendarLayout, { name: 'ViewCalendarLayout' });
registerEnumType(ViewVisibility, { name: 'ViewVisibility' });

@ObjectType('CoreView')
export class ViewDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field({ nullable: false })
  name: string;

  @Field(() => UUIDScalarType, { nullable: false })
  objectMetadataId: string;

  @Field(() => ViewType, { nullable: false, defaultValue: ViewType.TABLE })
  type: ViewType;

  @Field(() => ViewKey, { nullable: true, defaultValue: ViewKey.INDEX })
  key: ViewKey | null;

  @Field({ nullable: false })
  icon: string;

  @Field({ nullable: false, defaultValue: 0 })
  position: number;

  @Field({ nullable: false, defaultValue: false })
  isCompact: boolean;

  @Field({ nullable: false, defaultValue: false })
  isCustom: boolean;

  @Field(() => ViewOpenRecordIn, {
    nullable: false,
    defaultValue: ViewOpenRecordIn.SIDE_PANEL,
  })
  openRecordIn: ViewOpenRecordIn;

  @Field(() => AggregateOperations, { nullable: true })
  kanbanAggregateOperation?: AggregateOperations | null;

  @Field(() => UUIDScalarType, { nullable: true })
  kanbanAggregateOperationFieldMetadataId?: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  mainGroupByFieldMetadataId?: string | null;

  @Field({ nullable: false, defaultValue: false })
  shouldHideEmptyGroups: boolean;

  @Field(() => UUIDScalarType, { nullable: true })
  calendarFieldMetadataId?: string | null;

  @Field(() => UUIDScalarType, { nullable: false })
  workspaceId: string;

  @Field(() => String, { nullable: true })
  anyFieldFilterValue?: string | null;

  @Field(() => ViewCalendarLayout, { nullable: true })
  calendarLayout: ViewCalendarLayout | null;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;

  @Field(() => [ViewFieldDTO])
  viewFields?: ViewFieldDTO[];

  @Field(() => [ViewFilterDTO])
  viewFilters?: ViewFilterDTO[];

  @Field(() => [ViewFilterGroupDTO])
  viewFilterGroups?: ViewFilterGroupDTO[];

  @Field(() => [ViewSortDTO])
  viewSorts?: ViewSortDTO[];

  @Field(() => [ViewGroupDTO])
  viewGroups?: ViewGroupDTO[];

  @Field(() => ViewVisibility, {
    nullable: false,
  })
  visibility: ViewVisibility;

  @Field(() => UUIDScalarType, { nullable: true })
  createdByUserWorkspaceId?: string | null;
}
