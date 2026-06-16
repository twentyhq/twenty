import { SEARCH_FIELDS_FOR_DASHBOARD } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';

import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import {
  type CreateStandardSearchFieldArgs,
  createStandardSearchFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/create-standard-search-field-flat-metadata.util';

export const buildDashboardStandardFlatSearchFieldMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  twentyStandardApplicationId,
}: Omit<
  CreateStandardSearchFieldArgs<'dashboard'>,
  'context'
>): FlatSearchFieldMetadata[] =>
  SEARCH_FIELDS_FOR_DASHBOARD.map((searchField) =>
    createStandardSearchFieldFlatMetadata({
      objectName,
      workspaceId,
      context: {
        fieldName: searchField.name as AllStandardObjectFieldName<'dashboard'>,
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      twentyStandardApplicationId,
      now,
    }),
  );
