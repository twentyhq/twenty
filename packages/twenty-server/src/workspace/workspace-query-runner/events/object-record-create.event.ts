import { Record } from 'src/workspace/workspace-query-builder/interfaces/record.interface';

export class ObjectRecordCreateEvent {
  workspaceId: string;
  records: Record[];
}
