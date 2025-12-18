import { ObjectType } from '@nestjs/graphql';

import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';

import { RichTextV2BodyEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/rich-text-v2-body.entity';

@Entity({ name: 'standaloneRichTextConfiguration', schema: 'core' })
@ObjectType('StandaloneRichTextConfiguration')
export class StandaloneRichTextConfigurationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  bodyId: string;

  @ManyToOne(() => RichTextV2BodyEntity, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'bodyId' })
  body: Relation<RichTextV2BodyEntity>;
}
