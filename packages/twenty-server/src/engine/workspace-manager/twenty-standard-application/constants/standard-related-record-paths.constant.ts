/* @license Enterprise */

import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';

export type StandardRelatedRecordPath = {
  [O in AllStandardObjectName]: {
    objectName: O;
    fieldNames:
      | [AllStandardObjectFieldName<O>]
      | [AllStandardObjectFieldName<O>, string]
      | [AllStandardObjectFieldName<O>, string, string];
  };
}[AllStandardObjectName];

// A path grants every object it passes through, so only the longest chains are declared.
export const STANDARD_RELATED_RECORD_PATHS: StandardRelatedRecordPath[] = [
  { objectName: 'company', fieldNames: ['noteTargets', 'note', 'attachments'] },
  {
    objectName: 'company',
    fieldNames: ['noteTargets', 'note', 'timelineActivities'],
  },
  { objectName: 'company', fieldNames: ['taskTargets', 'task', 'attachments'] },
  {
    objectName: 'company',
    fieldNames: ['taskTargets', 'task', 'timelineActivities'],
  },
  {
    objectName: 'opportunity',
    fieldNames: ['noteTargets', 'note', 'attachments'],
  },
  {
    objectName: 'opportunity',
    fieldNames: ['noteTargets', 'note', 'timelineActivities'],
  },
  {
    objectName: 'opportunity',
    fieldNames: ['taskTargets', 'task', 'attachments'],
  },
  {
    objectName: 'opportunity',
    fieldNames: ['taskTargets', 'task', 'timelineActivities'],
  },
  { objectName: 'person', fieldNames: ['noteTargets', 'note', 'attachments'] },
  {
    objectName: 'person',
    fieldNames: ['noteTargets', 'note', 'timelineActivities'],
  },
  { objectName: 'person', fieldNames: ['taskTargets', 'task', 'attachments'] },
  {
    objectName: 'person',
    fieldNames: ['taskTargets', 'task', 'timelineActivities'],
  },
  { objectName: 'agentChatThread', fieldNames: ['attachments'] },
  { objectName: 'company', fieldNames: ['attachments'] },
  { objectName: 'dashboard', fieldNames: ['attachments'] },
  { objectName: 'opportunity', fieldNames: ['attachments'] },
  { objectName: 'person', fieldNames: ['attachments'] },
  { objectName: 'workflow', fieldNames: ['attachments'] },
  { objectName: 'company', fieldNames: ['timelineActivities'] },
  { objectName: 'dashboard', fieldNames: ['timelineActivities'] },
  { objectName: 'messageCampaign', fieldNames: ['timelineActivities'] },
  { objectName: 'messageList', fieldNames: ['timelineActivities'] },
  { objectName: 'opportunity', fieldNames: ['timelineActivities'] },
  { objectName: 'person', fieldNames: ['timelineActivities'] },
  { objectName: 'workflow', fieldNames: ['timelineActivities'] },
  { objectName: 'workflowRun', fieldNames: ['timelineActivities'] },
  { objectName: 'workflowVersion', fieldNames: ['timelineActivities'] },
  { objectName: 'agentChatThread', fieldNames: ['recordTargets'] },
  { objectName: 'calendarEvent', fieldNames: ['calendarEventTargets'] },
  { objectName: 'messageThread', fieldNames: ['messageThreadTargets'] },
];
