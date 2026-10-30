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
    isInherent: boolean;
  };
}[AllStandardObjectName];

export const STANDARD_RELATED_RECORD_PATHS: StandardRelatedRecordPath[] = [
  {
    objectName: 'agentChatThread',
    fieldNames: ['attachments'],
    isInherent: true,
  },
  { objectName: 'company', fieldNames: ['attachments'], isInherent: true },
  { objectName: 'dashboard', fieldNames: ['attachments'], isInherent: true },
  { objectName: 'note', fieldNames: ['attachments'], isInherent: true },
  { objectName: 'opportunity', fieldNames: ['attachments'], isInherent: true },
  { objectName: 'person', fieldNames: ['attachments'], isInherent: true },
  { objectName: 'task', fieldNames: ['attachments'], isInherent: true },
  { objectName: 'workflow', fieldNames: ['attachments'], isInherent: true },
  {
    objectName: 'company',
    fieldNames: ['timelineActivities'],
    isInherent: true,
  },
  {
    objectName: 'dashboard',
    fieldNames: ['timelineActivities'],
    isInherent: true,
  },
  {
    objectName: 'messageCampaign',
    fieldNames: ['timelineActivities'],
    isInherent: true,
  },
  {
    objectName: 'messageList',
    fieldNames: ['timelineActivities'],
    isInherent: true,
  },
  { objectName: 'note', fieldNames: ['timelineActivities'], isInherent: true },
  {
    objectName: 'opportunity',
    fieldNames: ['timelineActivities'],
    isInherent: true,
  },
  {
    objectName: 'person',
    fieldNames: ['timelineActivities'],
    isInherent: true,
  },
  { objectName: 'task', fieldNames: ['timelineActivities'], isInherent: true },
  {
    objectName: 'workflow',
    fieldNames: ['timelineActivities'],
    isInherent: true,
  },
  {
    objectName: 'workflowRun',
    fieldNames: ['timelineActivities'],
    isInherent: true,
  },
  {
    objectName: 'workflowVersion',
    fieldNames: ['timelineActivities'],
    isInherent: true,
  },
  {
    objectName: 'company',
    fieldNames: ['noteTargets', 'note'],
    isInherent: false,
  },
  {
    objectName: 'company',
    fieldNames: ['taskTargets', 'task'],
    isInherent: false,
  },
  {
    objectName: 'opportunity',
    fieldNames: ['noteTargets', 'note'],
    isInherent: false,
  },
  {
    objectName: 'opportunity',
    fieldNames: ['taskTargets', 'task'],
    isInherent: false,
  },
  {
    objectName: 'person',
    fieldNames: ['noteTargets', 'note'],
    isInherent: false,
  },
  {
    objectName: 'person',
    fieldNames: ['taskTargets', 'task'],
    isInherent: false,
  },
  {
    objectName: 'workspaceMember',
    fieldNames: ['messageParticipants', 'message'],
    isInherent: false,
  },
];
