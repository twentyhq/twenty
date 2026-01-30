import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { type MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';

export class MessageAttachmentWorkspaceEntity extends BaseWorkspaceEntity {
  messageId: string;
  fileId: string;
  filename: string;
  mimeType: string;
  size: number;

  message: EntityRelation<MessageWorkspaceEntity>;
  file: EntityRelation<FileEntity>;
}
