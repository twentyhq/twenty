import { ObjectType } from '@nestjs/graphql';

import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { IDField } from '@ptc-org/nestjs-query-graphql';

import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@Entity({ name: 'integrations', schema: 'core' })
@ObjectType('Integrations')
export class IntegrationsEntity extends WorkspaceRelatedEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, unique: true })
  whatsappBusinessAccountId: string;

  @Column({ nullable: true, unique: true })
  whatsappWebhookToken: string;
}
