import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { type APP_LOCALES } from 'twenty-shared/translations';

// Workspace-level translation overrides, keyed by i18n message id (the hash of
// the source string). Mirrors ApplicationTranslationEntity but scoped to a
// workspace: one row per (workspace, locale), `messages` maps messageId -> text.
@Entity({ name: 'workspaceTranslation', schema: 'core' })
@Index(
  'IDX_WORKSPACE_TRANSLATION_WORKSPACE_LOCALE_UNIQUE',
  ['workspaceId', 'locale'],
  {
    unique: true,
    where: '"deletedAt" IS NULL',
  },
)
export class WorkspaceTranslationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  workspaceId: string;

  @Column({ type: 'text' })
  locale: keyof typeof APP_LOCALES;

  @Column({ type: 'jsonb', default: {} })
  messages: Record<string, string>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
