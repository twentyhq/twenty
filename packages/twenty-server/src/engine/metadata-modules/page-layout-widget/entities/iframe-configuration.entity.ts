import { ObjectType } from '@nestjs/graphql';

import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'iframeConfiguration', schema: 'core' })
@ObjectType('IframeConfiguration')
export class IframeConfigurationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'text' })
  url?: string;
}

