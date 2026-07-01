import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export class UnsubscribeTopicWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  description: string | null;
  visibility: string;
  searchVector: string;
}
