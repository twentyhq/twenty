import { ObjectType } from '@nestjs/graphql';

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { GraphType } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-type.enum';
import { ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { CalendarStartDay } from 'twenty-shared/constants';
import { RatioAggregateConfigEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/ratio-aggregate-config.entity';

@Entity({ name: 'aggregateChartConfiguration', schema: 'core' })
@ObjectType('AggregateChartConfiguration')
export class AggregateChartConfigurationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: GraphType,
    nullable: false,
  })
  graphType: GraphType.AGGREGATE;

  @Column({ nullable: false, type: 'uuid' })
  aggregateFieldMetadataId: string;

  @Column({
    type: 'enum',
    enum: AggregateOperations,
    nullable: false,
  })
  aggregateOperation: AggregateOperations;

  @Column({ nullable: true, type: 'text' })
  label?: string;

  @Column({ nullable: true, type: 'boolean', default: false })
  displayDataLabel?: boolean;

  @Column({ nullable: true, type: 'text' })
  format?: string;

  @Column({ nullable: true, type: 'text' })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  filter?: ObjectRecordFilter;

  @Column({ nullable: true, type: 'text', default: 'UTC' })
  timezone?: string;

  @Column({ nullable: true, type: 'int', default: CalendarStartDay.MONDAY })
  firstDayOfTheWeek?: number;

  @Column({ nullable: true, type: 'text' })
  prefix?: string;

  @Column({ nullable: true, type: 'text' })
  suffix?: string;

  @Column({ nullable: true, type: 'uuid' })
  ratioAggregateConfigId?: string;

  @ManyToOne(() => RatioAggregateConfigEntity, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'ratioAggregateConfigId' })
  ratioAggregateConfig?: Relation<RatioAggregateConfigEntity>;
}
