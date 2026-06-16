import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { type AllStandardObjectName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-name.type';
import { buildCompanyStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-company-standard-flat-search-field-metadata.util';
import { buildDashboardStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-dashboard-standard-flat-search-field-metadata.util';
import { buildMessageListStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-message-list-standard-flat-search-field-metadata.util';
import { buildNoteStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-note-standard-flat-search-field-metadata.util';
import { buildOpportunityStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-opportunity-standard-flat-search-field-metadata.util';
import { buildPersonStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-person-standard-flat-search-field-metadata.util';
import { buildTaskStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-task-standard-flat-search-field-metadata.util';
import { buildWorkflowStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-workflow-standard-flat-search-field-metadata.util';
import { buildWorkspaceMemberStandardFlatSearchFieldMetadatas } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/compute-workspace-member-standard-flat-search-field-metadata.util';
import { type CreateStandardSearchFieldArgs } from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/create-standard-search-field-flat-metadata.util';

type StandardSearchFieldBuilder<P extends AllStandardObjectName> = (
  args: Omit<CreateStandardSearchFieldArgs<P>, 'context'>,
) => FlatSearchFieldMetadata[];

// Only objects with isSearchable: true (see create-standard-flat-object-metadata.util.ts)
// get searchFieldMetadata rows. Each object's field set mirrors the searchVector
// asExpression, which is built from the same SEARCH_FIELDS_FOR_* constant.
const STANDARD_FLAT_SEARCH_FIELD_METADATA_BUILDERS_BY_OBJECT_NAME = {
  company: buildCompanyStandardFlatSearchFieldMetadatas,
  dashboard: buildDashboardStandardFlatSearchFieldMetadatas,
  messageList: buildMessageListStandardFlatSearchFieldMetadatas,
  note: buildNoteStandardFlatSearchFieldMetadatas,
  opportunity: buildOpportunityStandardFlatSearchFieldMetadatas,
  person: buildPersonStandardFlatSearchFieldMetadatas,
  task: buildTaskStandardFlatSearchFieldMetadatas,
  workflow: buildWorkflowStandardFlatSearchFieldMetadatas,
  workspaceMember: buildWorkspaceMemberStandardFlatSearchFieldMetadatas,
} satisfies {
  [P in AllStandardObjectName]?: StandardSearchFieldBuilder<P>;
};

export const buildStandardFlatSearchFieldMetadataMaps = (
  args: Omit<CreateStandardSearchFieldArgs, 'context' | 'objectName'>,
): FlatEntityMaps<FlatSearchFieldMetadata> => {
  const allSearchFieldMetadatas: FlatSearchFieldMetadata[] = (
    Object.keys(
      STANDARD_FLAT_SEARCH_FIELD_METADATA_BUILDERS_BY_OBJECT_NAME,
    ) as (keyof typeof STANDARD_FLAT_SEARCH_FIELD_METADATA_BUILDERS_BY_OBJECT_NAME)[]
  ).flatMap((objectName) => {
    const builder: StandardSearchFieldBuilder<typeof objectName> =
      STANDARD_FLAT_SEARCH_FIELD_METADATA_BUILDERS_BY_OBJECT_NAME[objectName];

    return builder({
      ...args,
      objectName,
    });
  });

  let flatSearchFieldMetadataMaps = createEmptyFlatEntityMaps();

  for (const searchFieldMetadata of allSearchFieldMetadatas) {
    flatSearchFieldMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: searchFieldMetadata,
      flatEntityMaps: flatSearchFieldMetadataMaps,
    });
  }

  return flatSearchFieldMetadataMaps;
};
