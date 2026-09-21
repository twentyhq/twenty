import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { computeStandardAppAccessViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-app-access-views.util';
import { computeStandardAppViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-app-views.util';
import { computeStandardAttachmentViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-attachment-views.util';
import { computeStandardBlocklistViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-blocklist-views.util';
import { computeStandardCalendarChannelEventAssociationViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-calendar-channel-event-association-views.util';
import { computeStandardCalendarEventParticipantViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-calendar-event-participant-views.util';
import { computeStandardCalendarEventViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-calendar-event-views.util';
import { computeStandardCallRecordingViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-call-recording-views.util';
import { computeStandardCompanyViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-company-views.util';
import { computeStandardDashboardViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-dashboard-views.util';
import { computeStandardEpicViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-epic-views.util';
import { computeStandardMessageCampaignViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-message-campaign-views.util';
import { computeStandardMerchantViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-merchant-views.util';
import { computeStandardMessageChannelMessageAssociationMessageFolderViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-message-channel-message-association-message-folder-views.util';
import { computeStandardMessageChannelMessageAssociationViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-message-channel-message-association-views.util';
import { computeStandardMessageListViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-message-list-views.util';
import { computeStandardMessageListMemberViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-message-list-member-views.util';
import { computeStandardMessageParticipantViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-message-participant-views.util';
import { computeStandardMessageThreadViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-message-thread-views.util';
import { computeStandardMessageViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-message-views.util';
import { computeStandardNoteTargetViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-note-target-views.util';
import { computeStandardNoteViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-note-views.util';
import { computeStandardIssueCommentViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-issue-comment-views.util';
import { computeStandardIssueViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-issue-views.util';
import { computeStandardIssueStatusViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-issue-status-views.util';
import { computeStandardShiftViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-shift-views.util';
import { computeStandardShiftTemplateViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-shift-template-views.util';
import { computeStandardSpecialDayViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-special-day-views.util';
import { computeStandardWorklogViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-worklog-views.util';
import { computeStandardOpportunityViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-opportunity-views.util';
import { computeStandardPersonViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-person-views.util';
import { computeStandardProjectViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-project-views.util';
import { computeStandardSprintViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-sprint-views.util';
import { computeStandardTaskTargetViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-task-target-views.util';
import { computeStandardTaskViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-task-views.util';
import { computeStandardTimelineActivityViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-timeline-activity-views.util';
import { computeStandardWorkflowAutomatedTriggerViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-workflow-automated-trigger-views.util';
import { computeStandardWorkflowRunViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-workflow-run-views.util';
import { computeStandardWorkflowVersionViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-workflow-version-views.util';
import { computeStandardWorkflowViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-workflow-views.util';
import { computeStandardWorkspaceMemberViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-workspace-member-views.util';
import { type CreateStandardViewArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

type StandardViewBuilder<P extends AllStandardObjectName> = (
  args: Omit<CreateStandardViewArgs<P>, 'context'>,
) => Record<string, FlatView>;

const STANDARD_FLAT_VIEW_METADATA_BUILDERS_BY_OBJECT_NAME = {
  app: computeStandardAppViews,
  appAccess: computeStandardAppAccessViews,
  attachment: computeStandardAttachmentViews,
  blocklist: computeStandardBlocklistViews,
  calendarChannelEventAssociation:
    computeStandardCalendarChannelEventAssociationViews,
  calendarEvent: computeStandardCalendarEventViews,
  calendarEventParticipant: computeStandardCalendarEventParticipantViews,
  callRecording: computeStandardCallRecordingViews,
  company: computeStandardCompanyViews,
  dashboard: computeStandardDashboardViews,
  message: computeStandardMessageViews,
  messageCampaign: computeStandardMessageCampaignViews,
  messageChannelMessageAssociation:
    computeStandardMessageChannelMessageAssociationViews,
  messageChannelMessageAssociationMessageFolder:
    computeStandardMessageChannelMessageAssociationMessageFolderViews,
  messageList: computeStandardMessageListViews,
  messageListMember: computeStandardMessageListMemberViews,
  messageParticipant: computeStandardMessageParticipantViews,
  messageThread: computeStandardMessageThreadViews,
  note: computeStandardNoteViews,
  noteTarget: computeStandardNoteTargetViews,
  opportunity: computeStandardOpportunityViews,
  issue: computeStandardIssueViews,
  issueStatus: computeStandardIssueStatusViews,
  issueComment: computeStandardIssueCommentViews,
  worklog: computeStandardWorklogViews,
  shiftTemplate: computeStandardShiftTemplateViews,
  specialDay: computeStandardSpecialDayViews,
  shift: computeStandardShiftViews,
  person: computeStandardPersonViews,
  project: computeStandardProjectViews,
  merchant: computeStandardMerchantViews,
  sprint: computeStandardSprintViews,
  epic: computeStandardEpicViews,
  task: computeStandardTaskViews,
  taskTarget: computeStandardTaskTargetViews,
  timelineActivity: computeStandardTimelineActivityViews,
  workflow: computeStandardWorkflowViews,
  workflowAutomatedTrigger: computeStandardWorkflowAutomatedTriggerViews,
  workflowRun: computeStandardWorkflowRunViews,
  workflowVersion: computeStandardWorkflowVersionViews,
  workspaceMember: computeStandardWorkspaceMemberViews,
} as const satisfies {
  [P in AllStandardObjectName]?: StandardViewBuilder<P>;
};

export type BuildStandardFlatViewMetadataMapsArgs = Omit<
  CreateStandardViewArgs,
  'context' | 'objectName'
>;

export const buildStandardFlatViewMetadataMaps = (
  args: BuildStandardFlatViewMetadataMapsArgs,
): FlatEntityMaps<FlatView> => {
  const allViewMetadatas: FlatView[] = (
    Object.keys(
      STANDARD_FLAT_VIEW_METADATA_BUILDERS_BY_OBJECT_NAME,
    ) as (keyof typeof STANDARD_FLAT_VIEW_METADATA_BUILDERS_BY_OBJECT_NAME)[]
  ).flatMap((objectName) => {
    const builder: StandardViewBuilder<typeof objectName> =
      STANDARD_FLAT_VIEW_METADATA_BUILDERS_BY_OBJECT_NAME[objectName];

    const result = builder({
      ...args,
      objectName,
    });

    return Object.values(result);
  });

  let flatViewMaps = createEmptyFlatEntityMaps();

  for (const viewMetadata of allViewMetadatas) {
    flatViewMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: viewMetadata,
      flatEntityMaps: flatViewMaps,
    });
  }

  return flatViewMaps;
};
