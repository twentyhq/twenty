import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

type OwnableChildMetadataDeclaration<
  TChildMetadataName extends AllMetadataName,
> = {
  rootIdProperty: MetadataEntityPropertyName<TChildMetadataName>;
};

type OwnableRootMetadataDeclaration = {
  children: Partial<{
    [P in AllMetadataName]: OwnableChildMetadataDeclaration<P>;
  }>;
};

export const OWNABLE_METADATA_BY_ROOT_METADATA_NAME = {
  view: {
    children: {
      viewField: { rootIdProperty: 'viewId' },
      viewFilter: { rootIdProperty: 'viewId' },
      viewSort: { rootIdProperty: 'viewId' },
      viewGroup: { rootIdProperty: 'viewId' },
      viewFilterGroup: { rootIdProperty: 'viewId' },
      viewFieldGroup: { rootIdProperty: 'viewId' },
    },
  },
  workflow: {
    children: {
      workflowVersion: { rootIdProperty: 'coreWorkflowId' },
    },
  },
} as const satisfies Partial<
  Record<AllMetadataName, OwnableRootMetadataDeclaration>
>;
