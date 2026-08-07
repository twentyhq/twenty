import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export type NotificationStatus = 'UNREAD' | 'READ' | 'DONE';

// Flat JSON shape: recursive or unknown-valued types break TypeORM deep partials
export type NotificationPayload = Record<
  string,
  string | number | boolean | null
>;

export class NotificationWorkspaceEntity extends BaseWorkspaceEntity {
  type: string;
  title: string;
  preview: string | null;
  payload: NotificationPayload | null;
  requiresAction: boolean;
  status: NotificationStatus;
  dedupeKey: string | null;
  threadId: string | null;
  subjectRecordId: string | null;
  position: number;
  searchVector: string;
  workspaceMember: EntityRelation<WorkspaceMemberWorkspaceEntity>;
  workspaceMemberId: string;
}
