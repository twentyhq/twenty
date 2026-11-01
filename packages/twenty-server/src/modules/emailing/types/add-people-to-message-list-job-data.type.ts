import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export type AddPeopleToMessageListJobData = {
  workspaceId: string;
  userWorkspaceId: string;
  applicationId?: string;
  messageListId: string;
  personFilter: Partial<ObjectRecordFilter>;
};
