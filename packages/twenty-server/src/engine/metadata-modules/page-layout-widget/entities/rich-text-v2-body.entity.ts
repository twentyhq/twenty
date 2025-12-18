import { ObjectType } from '@nestjs/graphql';

import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'richTextV2Body', schema: 'core' })
@ObjectType('RichTextV2Body')
export class RichTextV2BodyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'text' })
  blocknote?: string | null;

  @Column({ nullable: true, type: 'text' })
  markdown: string | null;
}

