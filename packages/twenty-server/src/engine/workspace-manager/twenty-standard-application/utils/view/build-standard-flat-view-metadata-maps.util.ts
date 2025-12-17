import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { computeStandardCalendarEventViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-calendar-event-views.util';
import { computeStandardCompanyViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-company-views.util';
import { computeStandardDashboardViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-dashboard-views.util';
import { computeStandardMessageThreadViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-message-thread-views.util';
import { computeStandardMessageViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-message-views.util';
import { computeStandardNoteViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-note-views.util';
import { computeStandardOpportunityViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-opportunity-views.util';
import { computeStandardPersonViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-person-views.util';
import { computeStandardTaskViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-task-views.util';
import { computeStandardWorkflowRunViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-workflow-run-views.util';
import { computeStandardWorkflowViews } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/compute-standard-workflow-views.util';
import { type CreateStandardViewArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

type StandardViewBuilder<P extends AllStandardObjectName> = (
  args: Omit<CreateStandardViewArgs<P>, 'context'>,
) => Record<string, FlatView>;

const STANDARD_FLAT_VIEW_METADATA_BUILDERS_BY_OBJECT_NAME = {
  calendarEvent: computeStandardCalendarEventViews,
  company: computeStandardCompanyViews,
  dashboard: computeStandardDashboardViews,
  message: computeStandardMessageViews,
  messageThread: computeStandardMessageThreadViews,
  note: computeStandardNoteViews,
  opportunity: computeStandardOpportunityViews,
  person: computeStandardPersonViews,
  task: computeStandardTaskViews,
  workflow: computeStandardWorkflowViews,
  workflowRun: computeStandardWorkflowRunViews,
} as const satisfies {
  [P in AllStandardObjectName]?: StandardViewBuilder<P>;
};

export const buildStandardFlatViewMetadataMaps = (
  args: Omit<CreateStandardViewArgs, 'context' | 'objectName'>,
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
