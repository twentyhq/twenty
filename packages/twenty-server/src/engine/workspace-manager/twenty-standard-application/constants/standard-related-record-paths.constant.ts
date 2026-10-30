/* @license Enterprise */

import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';

export type StandardRelatedRecordPath = {
  [O in AllStandardObjectName]: {
    objectName: O;
    firstFieldName: AllStandardObjectFieldName<O>;
  };
}[AllStandardObjectName];

export const STANDARD_RELATED_RECORD_PATHS = [
  { objectName: 'agentChatThread', firstFieldName: 'recordTargets' },
  { objectName: 'agentChatThread', firstFieldName: 'attachments' },
  { objectName: 'company', firstFieldName: 'attachments' },
  { objectName: 'dashboard', firstFieldName: 'attachments' },
  { objectName: 'note', firstFieldName: 'attachments' },
  { objectName: 'opportunity', firstFieldName: 'attachments' },
  { objectName: 'person', firstFieldName: 'attachments' },
  { objectName: 'task', firstFieldName: 'attachments' },
  { objectName: 'workflow', firstFieldName: 'attachments' },
  { objectName: 'calendarEvent', firstFieldName: 'calendarEventTargets' },
  { objectName: 'messageThread', firstFieldName: 'messageThreadTargets' },
  { objectName: 'noteTarget', firstFieldName: 'note' },
  { objectName: 'company', firstFieldName: 'noteTargets' },
  { objectName: 'opportunity', firstFieldName: 'noteTargets' },
  { objectName: 'person', firstFieldName: 'noteTargets' },
  { objectName: 'taskTarget', firstFieldName: 'task' },
  { objectName: 'company', firstFieldName: 'taskTargets' },
  { objectName: 'opportunity', firstFieldName: 'taskTargets' },
  { objectName: 'person', firstFieldName: 'taskTargets' },
  { objectName: 'company', firstFieldName: 'timelineActivities' },
  { objectName: 'dashboard', firstFieldName: 'timelineActivities' },
  { objectName: 'messageCampaign', firstFieldName: 'timelineActivities' },
  { objectName: 'messageList', firstFieldName: 'timelineActivities' },
  { objectName: 'note', firstFieldName: 'timelineActivities' },
  { objectName: 'opportunity', firstFieldName: 'timelineActivities' },
  { objectName: 'person', firstFieldName: 'timelineActivities' },
  { objectName: 'task', firstFieldName: 'timelineActivities' },
  { objectName: 'workflow', firstFieldName: 'timelineActivities' },
  { objectName: 'workflowRun', firstFieldName: 'timelineActivities' },
  { objectName: 'workflowVersion', firstFieldName: 'timelineActivities' },
] as const satisfies StandardRelatedRecordPath[];
