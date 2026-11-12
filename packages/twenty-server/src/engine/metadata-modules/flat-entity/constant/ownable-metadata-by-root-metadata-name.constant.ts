import { type AllMetadataName } from 'twenty-shared/metadata';
import { ViewVisibility, WorkflowVisibility } from 'twenty-shared/types';

import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

type OwnableChildMetadataDeclaration<
  TChildMetadataName extends AllMetadataName,
> = {
  rootIdProperty: MetadataEntityPropertyName<TChildMetadataName>;
};

type OwnableRootMetadataDeclaration<TRootMetadataName extends AllMetadataName> =
  {
    visibilityProperty: MetadataEntityPropertyName<TRootMetadataName>;
    workspaceVisibility: string;
    privateVisibility: string;
    ownerProperty: MetadataEntityPropertyName<TRootMetadataName>;
    children: Partial<{
      [P in AllMetadataName]: OwnableChildMetadataDeclaration<P>;
    }>;
  };

export const OWNABLE_METADATA_BY_ROOT_METADATA_NAME = {
  view: {
    visibilityProperty: 'visibility',
    workspaceVisibility: ViewVisibility.WORKSPACE,
    privateVisibility: ViewVisibility.UNLISTED,
    ownerProperty: 'createdByUserWorkspaceId',
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
    visibilityProperty: 'visibility',
    workspaceVisibility: WorkflowVisibility.WORKSPACE,
    privateVisibility: WorkflowVisibility.PRIVATE,
    ownerProperty: 'createdByUserWorkspaceId',
    children: {
      workflowVersion: { rootIdProperty: 'coreWorkflowId' },
    },
  },
} as const satisfies Partial<{
  [P in AllMetadataName]: OwnableRootMetadataDeclaration<P>;
}>;
