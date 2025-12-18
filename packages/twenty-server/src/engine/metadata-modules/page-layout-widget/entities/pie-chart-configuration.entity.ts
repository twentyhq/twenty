import { ObjectType } from '@nestjs/graphql';

import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { ObjectRecordGroupByDateGranularity } from 'src/engine/metadata-modules/page-layout-widget/enums/date-granularity.enum';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { GraphType } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-type.enum';
import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { CalendarStartDay } from 'twenty-shared/constants';

@Entity({ name: 'pieChartConfiguration', schema: 'core' })
@ObjectType('PieChartConfiguration')
export class PieChartConfigurationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: GraphType,
    nullable: false,
  })
  graphType: GraphType.PIE;

  @Column({ nullable: false, type: 'uuid' })
  aggregateFieldMetadataId: string;

  @Column({
    type: 'enum',
    enum: AggregateOperations,
    nullable: false,
  })
  aggregateOperation: AggregateOperations;

  @Column({ nullable: false, type: 'uuid' })
  groupByFieldMetadataId: string;

  @Column({ nullable: true, type: 'text' })
  groupBySubFieldName?: string;

  @Column({
    type: 'enum',
    enum: ObjectRecordGroupByDateGranularity,
    nullable: true,
    default: ObjectRecordGroupByDateGranularity.DAY,
  })
  dateGranularity?: ObjectRecordGroupByDateGranularity;

  @Column({
    type: 'enum',
    enum: GraphOrderBy,
    nullable: true,
    default: GraphOrderBy.VALUE_DESC,
  })
  orderBy?: GraphOrderBy;

  @Column({ nullable: true, type: 'boolean', default: false })
  displayDataLabel?: boolean;

  @Column({ nullable: true, type: 'boolean', default: true })
  showCenterMetric?: boolean;

  @Column({ nullable: true, type: 'boolean', default: true })
  displayLegend?: boolean;

  @Column({ nullable: true, type: 'boolean', default: false })
  hideEmptyCategory?: boolean;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column({ nullable: true, type: 'text' })
  color?: string;

  @Column({ type: 'jsonb', nullable: true })
  filter?: ObjectRecordFilter;

  @Column({ nullable: true, type: 'text', default: 'UTC' })
  timezone?: string;

  @Column({ nullable: true, type: 'int', default: CalendarStartDay.MONDAY })
  firstDayOfTheWeek?: number;
}
