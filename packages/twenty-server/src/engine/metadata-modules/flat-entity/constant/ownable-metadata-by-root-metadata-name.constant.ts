import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataNamesWithForeignKeyTo } from 'src/engine/metadata-modules/flat-entity/types/metadata-names-with-foreign-key-to.type';

export const OWNABLE_METADATA_BY_ROOT_METADATA_NAME = {
  view: {
    // navigationMenuItem points at a view too, but it is navigation, not part of the view it opens
    children: [
      'viewField',
      'viewFilter',
      'viewSort',
      'viewGroup',
      'viewFilterGroup',
      'viewFieldGroup',
    ],
  },
  workflow: {
    children: ['workflowVersion'],
  },
} as const satisfies {
  [TRootMetadataName in AllMetadataName]?: {
    children: readonly MetadataNamesWithForeignKeyTo<TRootMetadataName>[];
  };
};
