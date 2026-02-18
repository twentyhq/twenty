import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { computeStandardCompanyViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-company-view-field-groups.util';
import { computeStandardNoteViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-note-view-field-groups.util';
import { computeStandardOpportunityViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-opportunity-view-field-groups.util';
import { computeStandardPersonViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-person-view-field-groups.util';
import { computeStandardTaskViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-task-view-field-groups.util';
import { computeStandardWorkflowRunViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-workflow-run-view-field-groups.util';
import { computeStandardWorkflowVersionViewFieldGroups } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/compute-standard-workflow-version-view-field-groups.util';
import { type CreateStandardViewFieldGroupArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/create-standard-view-field-group-flat-metadata.util';

type StandardViewFieldGroupBuilder<P extends AllStandardObjectName> = (
  args: Omit<CreateStandardViewFieldGroupArgs<P>, 'context'>,
) => Record<string, FlatViewFieldGroup>;

const STANDARD_FLAT_VIEW_FIELD_GROUP_METADATA_BUILDERS_BY_OBJECT_NAME = {
  company: computeStandardCompanyViewFieldGroups,
  person: computeStandardPersonViewFieldGroups,
  opportunity: computeStandardOpportunityViewFieldGroups,
  task: computeStandardTaskViewFieldGroups,
  note: computeStandardNoteViewFieldGroups,
  workflowRun: computeStandardWorkflowRunViewFieldGroups,
  workflowVersion: computeStandardWorkflowVersionViewFieldGroups,
} as const satisfies {
  [P in AllStandardObjectName]?: StandardViewFieldGroupBuilder<P>;
};

export type BuildStandardFlatViewFieldGroupMetadataMapsArgs = Omit<
  CreateStandardViewFieldGroupArgs,
  'context' | 'objectName'
> & {
  shouldIncludeRecordPageLayouts?: boolean;
};

export const buildStandardFlatViewFieldGroupMetadataMaps = ({
  shouldIncludeRecordPageLayouts,
  ...args
}: BuildStandardFlatViewFieldGroupMetadataMapsArgs): FlatEntityMaps<FlatViewFieldGroup> => {
  if (!shouldIncludeRecordPageLayouts) {
    return createEmptyFlatEntityMaps();
  }

  const allViewFieldGroupMetadatas: FlatViewFieldGroup[] = (
    Object.keys(
      STANDARD_FLAT_VIEW_FIELD_GROUP_METADATA_BUILDERS_BY_OBJECT_NAME,
    ) as (keyof typeof STANDARD_FLAT_VIEW_FIELD_GROUP_METADATA_BUILDERS_BY_OBJECT_NAME)[]
  ).flatMap((objectName) => {
    const builder: StandardViewFieldGroupBuilder<typeof objectName> =
      STANDARD_FLAT_VIEW_FIELD_GROUP_METADATA_BUILDERS_BY_OBJECT_NAME[
        objectName
      ];

    const result = builder({
      ...args,
      objectName,
    });

    return Object.values(result);
  });

  let flatViewFieldGroupMaps = createEmptyFlatEntityMaps();

  for (const viewFieldGroupMetadata of allViewFieldGroupMetadatas) {
    flatViewFieldGroupMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: viewFieldGroupMetadata,
      flatEntityMaps: flatViewFieldGroupMaps,
    });
  }

  return flatViewFieldGroupMaps;
};
