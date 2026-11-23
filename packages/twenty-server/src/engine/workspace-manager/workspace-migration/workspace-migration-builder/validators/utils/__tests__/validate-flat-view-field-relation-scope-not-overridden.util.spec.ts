import {
  FieldMetadataType,
  type UniversalViewFieldRelationScope,
  ViewFilterOperand,
  ViewSortDirection,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { validateFlatViewFieldRelationScopeNotOverridden } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-field-relation-scope-not-overridden.util';

const WORKSPACE_CUSTOM_APPLICATION = 'workspace-custom-application';
const OTHER_APPLICATION = 'other-application';
const STAGE_FILTER_ID = 'stage-filter';

// OPEN is the option a rename or a deletion just removed; WON and IN_PROGRESS exist
const stageField = getFlatFieldMetadataMock({
  universalIdentifier: 'stage-field',
  objectMetadataId: 'opportunity',
  type: FieldMetadataType.SELECT,
  options: [
    {
      id: 'in-progress',
      value: 'IN_PROGRESS',
      label: 'In progress',
      position: 0,
      color: 'blue',
    },
    { id: 'won', value: 'WON', label: 'Won', position: 1, color: 'green' },
  ],
});

const buildStageFilters = (
  stageFilterValues: string[] | null,
): UniversalViewFieldRelationScope['filters'] => {
  if (!isDefined(stageFilterValues)) {
    return [];
  }

  return [
    {
      id: STAGE_FILTER_ID,
      fieldMetadataUniversalIdentifier: stageField.universalIdentifier,
      operand: ViewFilterOperand.IS,
      value: stageFilterValues,
    },
  ];
};

const buildRelationScope = ({
  limit = 1,
  stageFilterValues = ['WON'],
}: {
  limit?: number;
  stageFilterValues?: string[] | null;
} = {}): UniversalViewFieldRelationScope => ({
  filters: buildStageFilters(stageFilterValues),
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
  ownerApplication = OTHER_APPLICATION,
  callerApplication = WORKSPACE_CUSTOM_APPLICATION,
  existingUniversalRelationScope = buildRelationScope(),
  universalRelationScope,
}: {
  ownerApplication?: string;
  callerApplication?: string;
  existingUniversalRelationScope?: UniversalViewFieldRelationScope;
  universalRelationScope: UniversalViewFieldRelationScope | null;
}) =>
  validateFlatViewFieldRelationScopeNotOverridden({
    existingFlatViewField: {
      applicationUniversalIdentifier: ownerApplication,
      isSystemSideEffect: false,
      universalRelationScope: existingUniversalRelationScope,
    },
    updatedFlatViewField: { universalRelationScope },
    flatFieldMetadataMaps: {
      byUniversalIdentifier: { [stageField.universalIdentifier]: stageField },
    },
    flatFieldMetadataOptionMaps: { byUniversalIdentifier: {} },
    buildOptions: {
      applicationUniversalIdentifier: callerApplication,
      workspaceCustomApplicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION,
    },
  });

describe('validateFlatViewFieldRelationScopeNotOverridden', () => {
  it.each([
    {
      title: 'changing the limit',
      universalRelationScope: buildRelationScope({ limit: 5 }),
    },
    { title: 'clearing the scope', universalRelationScope: null },
    {
      title: 'changing a filter value whose options still exist',
      universalRelationScope: buildRelationScope({
        stageFilterValues: ['IN_PROGRESS'],
      }),
    },
    {
      title: 'removing a filter whose options still exist',
      universalRelationScope: buildRelationScope({ stageFilterValues: null }),
    },
  ])(
    'rejects a workspace $title on an application-owned column',
    ({ universalRelationScope }) => {
      expect(validate({ universalRelationScope })).toHaveLength(1);
    },
  );

  it('rejects a filter rewrite that comes with another change', () => {
    expect(
      validate({
        existingUniversalRelationScope: buildRelationScope({
          stageFilterValues: ['OPEN'],
        }),
        universalRelationScope: buildRelationScope({
          limit: 5,
          stageFilterValues: ['IN_PROGRESS'],
        }),
      }),
    ).toHaveLength(1);
  });

  it.each([
    {
      title: 'a renamed option is rewritten in its filter',
      universalRelationScope: buildRelationScope({
        stageFilterValues: ['IN_PROGRESS'],
      }),
    },
    {
      title: 'a filter is dropped with its last option',
      universalRelationScope: buildRelationScope({ stageFilterValues: null }),
    },
  ])(
    'accepts the option maintenance of an application-owned column when $title',
    ({ universalRelationScope }) => {
      expect(
        validate({
          existingUniversalRelationScope: buildRelationScope({
            stageFilterValues: ['OPEN'],
          }),
          universalRelationScope,
        }),
      ).toEqual([]);
    },
  );

  it.each([
    {
      title: 'the owning application changes the scope',
      ownerApplication: OTHER_APPLICATION,
      callerApplication: OTHER_APPLICATION,
      universalRelationScope: buildRelationScope({ limit: 5 }),
    },
    {
      title: 'the workspace changes the scope of its own column',
      ownerApplication: WORKSPACE_CUSTOM_APPLICATION,
      callerApplication: WORKSPACE_CUSTOM_APPLICATION,
      universalRelationScope: buildRelationScope({ limit: 5 }),
    },
    {
      title: 'the scope of an application-owned column is unchanged',
      universalRelationScope: buildRelationScope(),
    },
  ])('accepts an update when $title', (args) => {
    expect(validate(args)).toEqual([]);
  });
});
