import { Record } from 'src/workspace/workspace-query-builder/interfaces/record.interface';

export class ObjectRecordUpdateEvent {
  workspaceId: string;
  records: Record[];
}
