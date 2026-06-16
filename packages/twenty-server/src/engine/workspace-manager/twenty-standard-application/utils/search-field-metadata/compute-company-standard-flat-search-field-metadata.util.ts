import { SEARCH_FIELDS_FOR_COMPANY } from 'src/modules/company/standard-objects/company.workspace-entity';

import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { type AllStandardObjectFieldName } from 'src/engine/workspace-manager/twenty-standard-application/types/all-standard-object-field-name.type';
import {
  type CreateStandardSearchFieldArgs,
  createStandardSearchFieldFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/search-field-metadata/create-standard-search-field-flat-metadata.util';

export const buildCompanyStandardFlatSearchFieldMetadatas = ({
  now,
  objectName,
  workspaceId,
  standardObjectMetadataRelatedEntityIds,
  dependencyFlatEntityMaps,
  twentyStandardApplicationId,
}: Omit<
  CreateStandardSearchFieldArgs<'company'>,
  'context'
>): FlatSearchFieldMetadata[] =>
  SEARCH_FIELDS_FOR_COMPANY.map((searchField) =>
    createStandardSearchFieldFlatMetadata({
      objectName,
      workspaceId,
      context: {
        fieldName: searchField.name as AllStandardObjectFieldName<'company'>,
      },
      standardObjectMetadataRelatedEntityIds,
      dependencyFlatEntityMaps,
      twentyStandardApplicationId,
      now,
    }),
  );
