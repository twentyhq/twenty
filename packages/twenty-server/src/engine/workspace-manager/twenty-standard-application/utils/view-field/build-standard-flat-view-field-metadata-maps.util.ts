import { isDefined } from 'twenty-shared/utils';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { computeStandardAttachmentViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-attachment-view-fields.util';
import { computeStandardCalendarEventViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-calendar-event-view-fields.util';
import { computeStandardCompanyViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-company-view-fields.util';
import { computeStandardDashboardViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-dashboard-view-fields.util';
import { computeStandardMessageThreadViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-message-thread-view-fields.util';
import { computeStandardMessageViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-message-view-fields.util';
import { computeStandardNoteTargetViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-note-target-view-fields.util';
import { computeStandardNoteViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-note-view-fields.util';
import { computeStandardOpportunityViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-opportunity-view-fields.util';
import { computeStandardPersonViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-person-view-fields.util';
import { computeStandardTaskTargetViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-task-target-view-fields.util';
import { computeStandardTaskViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-task-view-fields.util';
import { computeStandardTimelineActivityViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-timeline-activity-view-fields.util';
import { computeStandardWorkflowRunViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-workflow-run-view-fields.util';
import { computeStandardWorkflowVersionViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-workflow-version-view-fields.util';
import { computeStandardWorkflowViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-workflow-view-fields.util';
import { computeStandardWorkspaceMemberViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-workspace-member-view-fields.util';
import { type CreateStandardViewFieldArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

type StandardViewFieldBuilder<P extends AllStandardObjectName> = (
  args: Omit<CreateStandardViewFieldArgs<P>, 'context'>,
) => Record<string, FlatViewField>;

const STANDARD_FLAT_VIEW_FIELD_METADATA_BUILDERS_BY_OBJECT_NAME = {
  attachment: computeStandardAttachmentViewFields,
  calendarEvent: computeStandardCalendarEventViewFields,
  company: computeStandardCompanyViewFields,
  dashboard: computeStandardDashboardViewFields,
  message: computeStandardMessageViewFields,
  messageThread: computeStandardMessageThreadViewFields,
  note: computeStandardNoteViewFields,
  noteTarget: computeStandardNoteTargetViewFields,
  opportunity: computeStandardOpportunityViewFields,
  person: computeStandardPersonViewFields,
  task: computeStandardTaskViewFields,
  taskTarget: computeStandardTaskTargetViewFields,
  timelineActivity: computeStandardTimelineActivityViewFields,
  workflow: computeStandardWorkflowViewFields,
  workflowRun: computeStandardWorkflowRunViewFields,
  workflowVersion: computeStandardWorkflowVersionViewFields,
  workspaceMember: computeStandardWorkspaceMemberViewFields,
} as const satisfies {
  [P in AllStandardObjectName]?: StandardViewFieldBuilder<P>;
};

export type BuildStandardFlatViewFieldMetadataMapsArgs = Omit<
  CreateStandardViewFieldArgs,
  'context' | 'objectName'
> & {
  shouldIncludeRecordPageLayouts?: boolean;
};

export const buildStandardFlatViewFieldMetadataMaps = ({
  shouldIncludeRecordPageLayouts,
  ...args
}: BuildStandardFlatViewFieldMetadataMapsArgs): FlatEntityMaps<FlatViewField> => {
  const allViewFieldMetadatas: FlatViewField[] = (
    Object.keys(
      STANDARD_FLAT_VIEW_FIELD_METADATA_BUILDERS_BY_OBJECT_NAME,
    ) as (keyof typeof STANDARD_FLAT_VIEW_FIELD_METADATA_BUILDERS_BY_OBJECT_NAME)[]
  ).flatMap((objectName) => {
    const builder: StandardViewFieldBuilder<typeof objectName> =
      STANDARD_FLAT_VIEW_FIELD_METADATA_BUILDERS_BY_OBJECT_NAME[objectName];

    const result = builder({
      ...args,
      objectName,
    });

    return Object.values(result).filter(
      (viewField) =>
        shouldIncludeRecordPageLayouts ||
        isDefined(
          args.dependencyFlatEntityMaps.flatViewMaps.byUniversalIdentifier[
            viewField.viewUniversalIdentifier
          ],
        ),
    );
  });

  let flatViewFieldMaps = createEmptyFlatEntityMaps();

  for (const viewFieldMetadata of allViewFieldMetadatas) {
    flatViewFieldMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: viewFieldMetadata,
      flatEntityMaps: flatViewFieldMaps,
    });
  }

  return flatViewFieldMaps;
};
