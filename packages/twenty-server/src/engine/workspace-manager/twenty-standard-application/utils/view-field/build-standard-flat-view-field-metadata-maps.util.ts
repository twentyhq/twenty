import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatViewField } from 'src/engine/metadata-modules/flat-view-field/types/flat-view-field.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { computeStandardCalendarEventViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-calendar-event-view-fields.util';
import { computeStandardCompanyViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-company-view-fields.util';
import { computeStandardDashboardViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-dashboard-view-fields.util';
import { computeStandardMessageThreadViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-message-thread-view-fields.util';
import { computeStandardMessageViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-message-view-fields.util';
import { computeStandardNoteViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-note-view-fields.util';
import { computeStandardOpportunityViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-opportunity-view-fields.util';
import { computeStandardPersonViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-person-view-fields.util';
import { computeStandardTaskViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-task-view-fields.util';
import { computeStandardWorkflowRunViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-workflow-run-view-fields.util';
import { computeStandardWorkflowViewFields } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/compute-standard-workflow-view-fields.util';
import { type CreateStandardViewFieldArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field/create-standard-view-field-flat-metadata.util';

type StandardViewFieldBuilder<P extends AllStandardObjectName> = (
  args: Omit<CreateStandardViewFieldArgs<P>, 'context'>,
) => Record<string, FlatViewField>;

const STANDARD_FLAT_VIEW_FIELD_METADATA_BUILDERS_BY_OBJECT_NAME = {
  calendarEvent: computeStandardCalendarEventViewFields,
  company: computeStandardCompanyViewFields,
  dashboard: computeStandardDashboardViewFields,
  message: computeStandardMessageViewFields,
  messageThread: computeStandardMessageThreadViewFields,
  note: computeStandardNoteViewFields,
  opportunity: computeStandardOpportunityViewFields,
  person: computeStandardPersonViewFields,
  task: computeStandardTaskViewFields,
  workflow: computeStandardWorkflowViewFields,
  workflowRun: computeStandardWorkflowRunViewFields,
} as const satisfies {
  [P in AllStandardObjectName]?: StandardViewFieldBuilder<P>;
};

export const buildStandardFlatViewFieldMetadataMaps = (
  args: Omit<CreateStandardViewFieldArgs, 'context' | 'objectName'>,
): FlatEntityMaps<FlatViewField> => {
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

    return Object.values(result);
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
