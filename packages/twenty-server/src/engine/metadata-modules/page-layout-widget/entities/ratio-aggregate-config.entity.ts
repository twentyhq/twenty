import { ObjectType } from '@nestjs/graphql';

import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'ratioAggregateConfig', schema: 'core' })
@ObjectType('RatioAggregateConfig')
export class RatioAggregateConfigEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  fieldMetadataId: string;

  @Column({ nullable: false, type: 'text' })
  optionValue: string;
}

