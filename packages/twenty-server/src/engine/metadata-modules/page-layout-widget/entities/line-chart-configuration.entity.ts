import { ObjectType } from '@nestjs/graphql';

import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { AxisNameDisplay } from 'src/engine/metadata-modules/page-layout-widget/enums/axis-name-display.enum';
import { ObjectRecordGroupByDateGranularity } from 'src/engine/metadata-modules/page-layout-widget/enums/date-granularity.enum';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { GraphType } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-type.enum';
import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { CalendarStartDay } from 'twenty-shared/constants';

@Entity({ name: 'lineChartConfiguration', schema: 'core' })
@ObjectType('LineChartConfiguration')
export class LineChartConfigurationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: GraphType,
    nullable: false,
  })
  graphType: GraphType.LINE;

  @Column({ nullable: false, type: 'uuid' })
  aggregateFieldMetadataId: string;

  @Column({
    type: 'enum',
    enum: AggregateOperations,
    nullable: false,
  })
  aggregateOperation: AggregateOperations;

  @Column({ nullable: false, type: 'uuid' })
  primaryAxisGroupByFieldMetadataId: string;

  @Column({ nullable: true, type: 'text' })
  primaryAxisGroupBySubFieldName?: string;

  @Column({
    type: 'enum',
    enum: ObjectRecordGroupByDateGranularity,
    nullable: true,
    default: ObjectRecordGroupByDateGranularity.DAY,
  })
  primaryAxisDateGranularity?: ObjectRecordGroupByDateGranularity;

  @Column({
    type: 'enum',
    enum: GraphOrderBy,
    nullable: true,
    default: GraphOrderBy.FIELD_ASC,
  })
  primaryAxisOrderBy?: GraphOrderBy;

  @Column({ nullable: true, type: 'uuid' })
  secondaryAxisGroupByFieldMetadataId?: string;

  @Column({ nullable: true, type: 'text' })
  secondaryAxisGroupBySubFieldName?: string;

  @Column({
    type: 'enum',
    enum: ObjectRecordGroupByDateGranularity,
    nullable: true,
    default: ObjectRecordGroupByDateGranularity.DAY,
  })
  secondaryAxisGroupByDateGranularity?: ObjectRecordGroupByDateGranularity;

  @Column({
    type: 'enum',
    enum: GraphOrderBy,
    nullable: true,
  })
  secondaryAxisOrderBy?: GraphOrderBy;

  @Column({ nullable: true, type: 'boolean' })
  omitNullValues?: boolean;

  @Column({
    type: 'enum',
    enum: AxisNameDisplay,
    nullable: true,
    default: AxisNameDisplay.NONE,
  })
  axisNameDisplay?: AxisNameDisplay;

  @Column({ nullable: true, type: 'boolean', default: false })
  displayDataLabel?: boolean;

  @Column({ nullable: true, type: 'boolean', default: true })
  displayLegend?: boolean;

  @Column({ nullable: true, type: 'numeric' })
  rangeMin?: number;

  @Column({ nullable: true, type: 'numeric' })
  rangeMax?: number;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column({ nullable: true, type: 'text' })
  color?: string;

  @Column({ type: 'jsonb', nullable: true })
  filter?: ObjectRecordFilter;

  @Column({ nullable: true, type: 'boolean' })
  isStacked?: boolean;

  @Column({ nullable: true, type: 'boolean' })
  isCumulative?: boolean;

  @Column({ nullable: true, type: 'text', default: 'UTC' })
  timezone?: string;

  @Column({ nullable: true, type: 'int', default: CalendarStartDay.MONDAY })
  firstDayOfTheWeek?: number;
}
