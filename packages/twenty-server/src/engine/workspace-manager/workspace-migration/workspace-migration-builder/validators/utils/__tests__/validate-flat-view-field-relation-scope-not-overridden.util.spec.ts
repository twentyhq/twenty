import {
  type UniversalViewFieldRelationScope,
  ViewSortDirection,
} from 'twenty-shared/types';

import { validateFlatViewFieldRelationScopeNotOverridden } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-field-relation-scope-not-overridden.util';

const WORKSPACE_CUSTOM_APPLICATION = 'workspace-custom-application';
const OTHER_APPLICATION = 'other-application';

const buildRelationScope = (
  limit: number,
): UniversalViewFieldRelationScope => ({
  filters: [],
  filterGroups: [],
  sorts: [
    {
      fieldMetadataUniversalIdentifier: 'due-at-field',
      direction: ViewSortDirection.ASC,
    },
  ],
  limit,
});

const validate = ({
  ownerApplication,
  callerApplication,
  universalRelationScope,
}: {
  ownerApplication: string;
  callerApplication: string;
  universalRelationScope: UniversalViewFieldRelationScope | null;
}) =>
  validateFlatViewFieldRelationScopeNotOverridden({
    existingFlatViewField: {
      applicationUniversalIdentifier: ownerApplication,
      isSystemSideEffect: false,
      universalRelationScope: buildRelationScope(1),
    },
    updatedFlatViewField: { universalRelationScope },
    buildOptions: {
      applicationUniversalIdentifier: callerApplication,
      workspaceCustomApplicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION,
    },
  });

describe('validateFlatViewFieldRelationScopeNotOverridden', () => {
  it.each([
    { title: 'changing', universalRelationScope: buildRelationScope(5) },
    { title: 'clearing', universalRelationScope: null },
  ])(
    'rejects a workspace $title the scope of an application-owned column',
    ({ universalRelationScope }) => {
      expect(
        validate({
          ownerApplication: OTHER_APPLICATION,
          callerApplication: WORKSPACE_CUSTOM_APPLICATION,
          universalRelationScope,
        }),
      ).toHaveLength(1);
    },
  );

  it.each([
    {
      title: 'the owning application changes the scope',
      ownerApplication: OTHER_APPLICATION,
      callerApplication: OTHER_APPLICATION,
      universalRelationScope: buildRelationScope(5),
    },
    {
      title: 'the workspace changes the scope of its own column',
      ownerApplication: WORKSPACE_CUSTOM_APPLICATION,
      callerApplication: WORKSPACE_CUSTOM_APPLICATION,
      universalRelationScope: buildRelationScope(5),
    },
    {
      title: 'the scope of an application-owned column is unchanged',
      ownerApplication: OTHER_APPLICATION,
      callerApplication: WORKSPACE_CUSTOM_APPLICATION,
      universalRelationScope: buildRelationScope(1),
    },
  ])('accepts an update when $title', (args) => {
    expect(validate(args)).toEqual([]);
  });
});
