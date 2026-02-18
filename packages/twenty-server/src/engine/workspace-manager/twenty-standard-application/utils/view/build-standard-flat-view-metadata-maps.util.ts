import { ViewType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { computeStandardAttachmentViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-attachment-views.util';
import { computeStandardCalendarEventViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-calendar-event-views.util';
import { computeStandardCompanyViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-company-views.util';
import { computeStandardDashboardViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-dashboard-views.util';
import { computeStandardMessageThreadViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-message-thread-views.util';
import { computeStandardMessageViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-message-views.util';
import { computeStandardNoteTargetViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-note-target-views.util';
import { computeStandardNoteViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-note-views.util';
import { computeStandardOpportunityViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-opportunity-views.util';
import { computeStandardPersonViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-person-views.util';
import { computeStandardTaskTargetViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-task-target-views.util';
import { computeStandardTaskViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-task-views.util';
import { computeStandardTimelineActivityViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-timeline-activity-views.util';
import { computeStandardWorkflowRunViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-workflow-run-views.util';
import { computeStandardWorkflowVersionViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-workflow-version-views.util';
import { computeStandardWorkflowViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-workflow-views.util';
import { computeStandardWorkspaceMemberViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-workspace-member-views.util';
import { type CreateStandardViewArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

type StandardViewBuilder<P extends AllStandardObjectName> = (
  args: Omit<CreateStandardViewArgs<P>, 'context'>,
) => Record<string, FlatView>;

const STANDARD_FLAT_VIEW_METADATA_BUILDERS_BY_OBJECT_NAME = {
  attachment: computeStandardAttachmentViews,
  calendarEvent: computeStandardCalendarEventViews,
  company: computeStandardCompanyViews,
  dashboard: computeStandardDashboardViews,
  message: computeStandardMessageViews,
  messageThread: computeStandardMessageThreadViews,
  note: computeStandardNoteViews,
  noteTarget: computeStandardNoteTargetViews,
  opportunity: computeStandardOpportunityViews,
  person: computeStandardPersonViews,
  task: computeStandardTaskViews,
  taskTarget: computeStandardTaskTargetViews,
  timelineActivity: computeStandardTimelineActivityViews,
  workflow: computeStandardWorkflowViews,
  workflowRun: computeStandardWorkflowRunViews,
  workflowVersion: computeStandardWorkflowVersionViews,
  workspaceMember: computeStandardWorkspaceMemberViews,
} as const satisfies {
  [P in AllStandardObjectName]?: StandardViewBuilder<P>;
};

export type BuildStandardFlatViewMetadataMapsArgs = Omit<
  CreateStandardViewArgs,
  'context' | 'objectName'
> & {
  shouldIncludeRecordPageLayouts?: boolean;
};

export const buildStandardFlatViewMetadataMaps = ({
  shouldIncludeRecordPageLayouts,
  ...args
}: BuildStandardFlatViewMetadataMapsArgs): FlatEntityMaps<FlatView> => {
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

    return Object.values(result).filter(
      (view) =>
        shouldIncludeRecordPageLayouts || view.type !== ViewType.FIELDS_WIDGET,
    );
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
